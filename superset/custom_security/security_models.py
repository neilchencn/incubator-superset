# -*- coding: utf-8 -*-
from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from __future__ import unicode_literals
import sys
import logging

from flask_appbuilder.const import LOGMSG_WAR_SEC_LOGIN_FAILED, LOGMSG_INF_SEC_ADD_USER, LOGMSG_ERR_SEC_ADD_USER
from werkzeug.security import check_password_hash, generate_password_hash
from superset.custom_security.security_views import MyAuthRemoteUserView
from flask_appbuilder.security.views import UserDBModelView, UserRemoteUserModelView
from superset.security import SupersetSecurityManager
import requests

import datetime
from decimal import Decimal
import hmac
import struct
import hashlib
import binascii
import base64
from superset.custom_security import six
import time

# Use the system PRNG if possible
import random
try:
    random = random.SystemRandom()
    using_sysrandom = True
except NotImplementedError:
    import warnings
    warnings.warn('A secure pseudo-random number generator is not available '
                  'on your system. ')
    using_sysrandom = False

logger = logging.getLogger(__name__)


class MyUserDBView(UserDBModelView):
    def pre_add(self, item):
        item.password = generate_password_django(item.password)


class Promise(object):
    pass


def _bin_to_long(x):
    return int(binascii.hexlify(x), 16)


def _long_to_bin(x, hex_format_string):
    return binascii.unhexlify((hex_format_string % x).encode('ascii'))


def is_protected_type(obj):
    return isinstance(obj, six.integer_types + (type(None), float, Decimal,
                                                datetime.datetime, datetime.date, datetime.time))


def force_bytes(s, encoding='utf-8', strings_only=False, errors='strict'):
    # Handle the common case first for performance reasons.
    if isinstance(s, bytes):
        if encoding == 'utf-8':
            return s
        else:
            return s.decode('utf-8', errors).encode(encoding, errors)
    if strings_only and is_protected_type(s):
        return s
    if isinstance(s, six.memoryview):
        return bytes(s)
    if isinstance(s, Promise):
        return six.text_type(s).encode(encoding, errors)
    if not isinstance(s, six.string_types):
        try:
            if six.PY3:
                return six.text_type(s).encode(encoding)
            else:
                return bytes(s)
        except UnicodeEncodeError:
            if isinstance(s, Exception):
                # An Exception subclass containing non-ASCII data that doesn't
                # know how to print itself properly. We shouldn't raise a
                # further exception.
                return b' '.join([force_bytes(arg, encoding, strings_only,
                                              errors) for arg in s])
            return six.text_type(s).encode(encoding, errors)
    else:
        return s.encode(encoding, errors)


def pbkdf2(password, salt, iterations, dklen=0, digest=None):
    assert iterations > 0
    if not digest:
        digest = hashlib.sha256
    password = force_bytes(password)
    salt = force_bytes(salt)
    hlen = digest().digest_size
    if not dklen:
        dklen = hlen
    if dklen > (2 ** 32 - 1) * hlen:
        raise OverflowError('dklen too big')
    l = -(-dklen // hlen)
    r = dklen - (l - 1) * hlen

    hex_format_string = "%%0%ix" % (hlen * 2)

    inner, outer = digest(), digest()
    if len(password) > inner.block_size:
        password = digest(password).digest()
    password += b'\x00' * (inner.block_size - len(password))
    inner.update(password.translate(hmac.trans_36))
    outer.update(password.translate(hmac.trans_5C))

    def F(i):
        u = salt + struct.pack(b'>I', i)
        result = 0
        for j in xrange(int(iterations)):
            dig1, dig2 = inner.copy(), outer.copy()
            dig1.update(u)
            dig2.update(dig1.digest())
            u = dig2.digest()
            result ^= _bin_to_long(u)
        return _long_to_bin(result, hex_format_string)

    T = [F(x) for x in range(1, l)]
    return b''.join(T) + F(l)[:r]


def constant_time_compare(val1, val2):
    if len(val1) != len(val2):
        return False
    result = 0
    if six.PY3 and isinstance(val1, bytes) and isinstance(val2, bytes):
        for x, y in zip(val1, val2):
            result |= x ^ y
    else:
        for x, y in zip(val1, val2):
            result |= ord(x) ^ ord(y)
    return result == 0


def get_random_string(length=12,
                      allowed_chars='abcdefghijklmnopqrstuvwxyz'
                                    'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'):
    """
    Returns a securely generated random string.

    The default length of 12 with the a-z, A-Z, 0-9 character set returns
    a 71-bit value. log_2((26+26+10)^12) =~ 71 bits
    """
    if not using_sysrandom:
        # This is ugly, and a hack, but it makes things better than
        # the alternative of predictability. This re-seeds the PRNG
        # using a value that is hard for an attacker to predict, every
        # time a random string is required. This may change the
        # properties of the chosen random sequence slightly, but this
        # is better than absolute predictability.
        random.seed(
            hashlib.sha256(
                ("%s%s%s" % (
                    random.getstate(),
                    time.time(),
                    '')).encode('utf-8')
            ).digest())
    return ''.join(random.choice(allowed_chars) for i in range(length))


def generate_password_django(password, salt=None):
    if salt is None:
        salt = get_random_string()
    hash = pbkdf2(password, salt, 15000, digest=hashlib.sha256)
    hash = base64.b64encode(hash).decode('ascii').strip()
    return "%s$%d$%s$%s" % ("pbkdf2_sha256", 15000, salt, hash)


class MySecurityManager(SupersetSecurityManager):
    logger.info("using customize my security manager")
    # authremoteuserview = MyAuthRemoteUserView
    authdbview = MyAuthRemoteUserView
    userdbmodelview = MyUserDBView

    def reset_password(self, userid, password):
        """
            Change/Reset a user's password for authdb.
            Password will be hashed and saved.

            :param userid:
                the user.id to reset the password
            :param password:
                The clear text password to reset and save hashed on the db
        """
        user = self.get_user_by_id(userid)
        user.password = generate_password_django(password)
        self.update_user(user)

    def verify(self, password, encoded):
        algorithm, iterations, salt, hash = encoded.split('$', 3)
        encoded_2 = generate_password_django(password, salt)
        return constant_time_compare(encoded, encoded_2)

    def add_user(self, username, first_name, last_name, email, role, password='', hashed_password=''):
        """
            Generic function to create user
        """

        try:
            user = self.user_model()
            user.first_name = first_name
            user.last_name = last_name
            user.username = username
            user.email = email
            user.active = True
            user.roles.append(role)
            if hashed_password:
                user.password = hashed_password
            else:
                user.password = generate_password_django(password)

            self.get_session.add(user)
            self.get_session.commit()
            logger.info(LOGMSG_INF_SEC_ADD_USER.format(username))
            return user
        except Exception as e:
            logger.error(LOGMSG_ERR_SEC_ADD_USER.format(str(e)))
            return False

    def auth_user_db(self, login_user, is_cmc=False, roles=[]):
        """
            this is a overwrite method

            REMOTE_USER user Authentication
            :type self: User model
        """
        user = self.find_user(username=login_user.get('username'))

        # User does not exist, create one if auto user registration.
        # todo:u'managedcompanys' (4658539616) u'is_superuser' (4658538560)
        if user is None:
            if is_cmc:
                user = self.add_user(
                    # All we have is REMOTE_USER, so we set
                    # the other fields to blank.
                    username=login_user.get('username'),
                    first_name='CMC',
                    last_name=login_user.get('username'),
                    email=login_user.get('email'),
                    password='hailhydra',
                    role=self.find_role(self.auth_user_registration_role))
            # else:
                # todo: remote auth from hydra
                # If user does not exist on the DB and not auto user registration,
                # or user is inactive, go away.
        if user is None or (not user.is_active()):
            logger.info(LOGMSG_WAR_SEC_LOGIN_FAILED.format(
                login_user.get('username')))
            return None

        if is_cmc or self.verify(login_user.get('password'), user.password):
            self.update_user_auth_stat(user, True)
            return user
        else:
            self.update_user_auth_stat(user, False)
            logger.info(LOGMSG_WAR_SEC_LOGIN_FAILED.format(
                login_user.get('username')))
            return None
