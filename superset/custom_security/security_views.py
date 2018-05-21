# -*- coding: utf-8 -*-
from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from __future__ import unicode_literals

from flask import g, redirect, flash
from flask_appbuilder._compat import as_unicode
from flask_appbuilder.forms import DynamicForm
from flask_appbuilder.security.views import AuthDBView, expose
from flask_babel import lazy_gettext
from flask_login import login_user
from wtforms import StringField, PasswordField
from wtforms.validators import Required, Email
from superset.models.dictionary import Company
from .apiclient import client, SSO_API_AUTH_SETTING
from . import REMOTE_REQUEST_TOKEN_URL, REMOTE_SSO_LOGIN_URL, REMOTE_AUTH_TOKEN_URL
from flask import request
import urllib
import urlparse

# import the remote server here
# remote server API to authenticate username/Email
# from . import remote_server_api

import logging
logger = logging.getLogger(__name__)


def build_absolute_uri(host_url, path=None):
    """Build absolute URI with given (optional) path"""
    path = path or ''
    if path.startswith('http://') or path.startswith('https://'):
        return path
    if host_url.endswith('/') and path.startswith('/'):
        path = path[1:]
    return host_url + path


class MyLoginForm(DynamicForm):
    """
    My customize login form, only set email and password as login request
    more options could be set here
    """
    username = StringField(
        lazy_gettext('Username'), validators=[Required()])
    password = PasswordField(lazy_gettext("Password"), validators=[Required()])


class MyAuthRemoteUserView(AuthDBView):
    # this front-end template should be put under the folder `superset/templates/appbuilder/general/security`
    # so that superset could find this templates to render
    login_template = 'appbuilder/general/custom_security/login_remote.html'
    title = "My Login"

    def create_missing_perms(self):
        """Creates missing perms for datasources, schemas and metrics"""

        print(
            'Fetching a set of all perms to lookup which ones are missing')
        all_pvs = set()
        for pv in self.appbuilder.sm.get_session.query(self.appbuilder.sm.permissionview_model).all():
            if pv.permission and pv.view_menu:
                all_pvs.add((pv.permission.name, pv.view_menu.name))

        def merge_perm(sm, permission_name, view_menu_name):
            # Implementation copied from sm.find_permission_view_menu.
            # TODO: use sm.find_permission_view_menu once issue
            #       https://github.com/airbnb/superset/issues/1944 is resolved.
            permission = self.appbuilder.sm.find_permission(permission_name)
            view_menu = self.appbuilder.sm.find_view_menu(view_menu_name)
            pv = None
            if permission and view_menu:
                pv = self.appbuilder.sm.get_session.query(self.appbuilder.sm.permissionview_model).filter_by(
                    permission=permission, view_menu=view_menu).first()
            if not pv and permission_name and view_menu_name:
                self.appbuilder.sm.add_permission_view_menu(
                    permission_name, view_menu_name)

        def merge_pv(view_menu, perm):
            """Create permission view menu only if it doesn't exist"""
            if view_menu and perm and (view_menu, perm) not in all_pvs:
                merge_perm(self.appbuilder.sm, view_menu, perm)

        print('Create missing company perm')
        companies = self.appbuilder.sm.get_session.query(Company).all()
        print('len companies:{}'.format(len(companies)))
        # for c in companies:
        # merge_pv('company_access', '{}'.format('neil_test'))

    # this method is going to overwrite
    # https://github.com/dpgaspar/Flask-AppBuilder/blob/master/flask_appbuilder/security/views.py#L556
    @expose('/loginlocal/', methods=['GET', 'POST'])
    def loginlocal(self):
        logger.info("My special login...")
        if g.user is not None and g.user.is_authenticated():
            return redirect(self.appbuilder.get_url_for_index)

        form = MyLoginForm()

        if form.validate_on_submit():
            # logger.info("going to auth MY user: %s" % form.email.data)
            # my_user = remote_server_api.authenticate(form.email.data,
            #                                          form.password.data)
            # if my_user is authenticated
            # if my_user:
            user = self.appbuilder.sm.auth_user_db(
                {'username': form.username.data, 'password': form.password.data})

            # print(dir(self))
            # print(dir(self.appbuilder))
            # print(dir(self.appbuilder.app))
            # print(self.appbuilder.session)
            # print(dir(self.appbuilder.session))
            self.create_missing_perms()
            if user is None:
                flash(as_unicode(self.invalid_login_message), 'warning')
            else:
                login_user(user)
                return redirect(self.appbuilder.get_url_for_index)
            # else:
            #     flash(as_unicode(self.invalid_login_message), 'warning')
        else:
            if form.errors.get('email') is not None:
                flash(
                    as_unicode(" ".join(form.errors.get('email'))), 'warning')

        return self.render_template(
            self.login_template,
            title=self.title,
            form=form,
            appbuilder=self.appbuilder)

    def authenticate(self, request_token, auth_token, **credentials):
        code, user_info = client.send_request(
            REMOTE_AUTH_TOKEN_URL + "?" + urllib.urlencode({"request_token": request_token, "auth_token": auth_token}))
        user = user_info["user"]
        return user

    @expose('/auth/')
    def auth_login(self):
        request_token = request.args.get("request_token")
        auth_token = request.args.get("auth_token")
        redirect_to = request.args.get("redirect", "/login/")

        user = self.authenticate(
            request_token=request_token, auth_token=auth_token)
        # print(user)
        local_user = self.appbuilder.sm.auth_user_db(
            user, is_cmc=True)
        # import pydevd
        # pydevd.settrace('localhost', port=12345,
        #                 stdoutToServer=True, stderrToServer=True)
        # print(client.send_request('/restapi/product/'))
        # print(client.send_request('/restapi/company/'))
        # print(client.send_request('/restapi/group/'))
        if local_user is not None:
            login_user(local_user)
            return redirect(self.appbuilder.get_url_for_index)
        else:
            raise PermissionDenied
        return redirect(redirect_to)

    @expose('/login/', methods=['GET', 'POST'])
    def login(self):
        logger.info("My special login...")
        if g.user is not None and g.user.is_authenticated():
            return redirect(self.appbuilder.get_url_for_index)
        else:
            _, token_info = client.send_request(REMOTE_REQUEST_TOKEN_URL)
            request_token = token_info["request_token"]

            restserver = SSO_API_AUTH_SETTING["url"]
            url_parts = list(urlparse.urlparse(restserver))
            query = {"api_key": SSO_API_AUTH_SETTING["apikey"],
                     "request_token": request_token,
                     "next": build_absolute_uri(
                '{}auth/'.format(request.host_url) + "?redirect=%s" % request.args.get("next", '/login/'))}
            url_parts[2] = REMOTE_SSO_LOGIN_URL
            url_parts[4] = urllib.urlencode(query)
            ssoLoginURL = urlparse.urlunparse(url_parts)
            return redirect(ssoLoginURL)
        # form = MyLoginForm()

        # if form.validate_on_submit():
            # logger.info("going to auth MY user: %s" % form.email.data)
            # my_user = remote_server_api.authenticate(form.email.data,
            #                                          form.password.data)
            # if my_user is authenticated
            # if my_user:
        #
        # print(user)
        # print(dir(self))
        # print(dir(self.appbuilder))
        # print(dir(self.appbuilder.app))
        # print(self.appbuilder.session)
        # print(dir(self.appbuilder.session))
        # self.create_missing_perms()
        # if user is None:
        #     flash(as_unicode(self.invalid_login_message), 'warning')
        # else:
        #     login_user(user)
        #     return redirect(self.appbuilder.get_url_for_index)
            # else:
            #     flash(as_unicode(self.invalid_login_message), 'warning')
    # else:
    #     if form.errors.get('email') is not None:
    #         flash(
    #             as_unicode(" ".join(form.errors.get('email'))), 'warning')

        # return self.render_template(
        #     self.login_template,
        #     title=self.title,
        #     form=form,
        #     appbuilder=self.appbuilder)
