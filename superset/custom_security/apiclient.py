import urllib
import urllib2
import json
import urlparse
import time
import logging
import hmac
import hashlib
import base64
import abc

from urllib2 import HTTPError


logging.basicConfig()
logger = logging.getLogger("API_CLIENT")
logger.setLevel(logging.DEBUG)


class AbsAPIClient(object):  # provide overwrite later
    __metaclass__ = abc.ABCMeta

    @abc.abstractmethod
    def send_request(self, url, data=None, datafunc=json.loads):
        return


class APIClientHTTPError(Exception):
    def __init__(self, reason, code, *args, **kwargs):
        super(self).__init__(reason, code, *args, **kwargs)
        self.code = code
        self.message = reason


class APIClient(AbsAPIClient):
    def __init__(self, apikey, seckey, url):
        self.opener = urllib2.build_opener()
        self._baseurl = url
        self._ak = str(apikey)
        self._sk = str(seckey)

    def _sign_msg(self, msg):
        dig = hmac.new(self._sk, msg, digestmod=hashlib.sha256).digest()
        return base64.b64encode(dig).decode()

    def _sign_url(self, _url):
        url = ("/" + _url) if not _url.startswith("/") else _url
        url_parts = urlparse.urlparse(url)
        qs = urlparse.parse_qs(url_parts.query)
        qs["timestamp"] = time.time()  # UNIX time
        qs["apikey"] = self._ak
        new_qs = urllib.urlencode(qs, True)
        tmpurl = urlparse.urlunparse(
            list(url_parts[0:4]) + [new_qs] + list(url_parts[5:]))
        final_url = tmpurl + "&signature=" + self._sign_msg(tmpurl)  # sign url
        return final_url

    def send_request(self, url, data=None, datafunc=json.loads):
        logger.debug("send to: %s" % urlparse.urljoin(
            self._baseurl, self._sign_url(url)))
        try:
            resp = self.opener.open(urlparse.urljoin(
                self._baseurl, self._sign_url(url)), data)
            return resp.code, datafunc(resp.read()) if datafunc else resp.read()
        except HTTPError as e:
            raise Exception(e.msg)


SSO_API_AUTH_SETTING = {
    "apikey": "c900b268",
    "seckey": "6e1cda4b00114ef19c03b2049f201eee",
    "url": "http://cmc.futuredial.com",
}

# for local test, client host bind 58.213.22.146:8889, neil's dev machine
# SSO_API_AUTH_SETTING = {
#     "apikey": "a9d8bfee",
#     "seckey": "a2d4e2422ef6412fbe540941d8726bfb",
#     "url": "http://cmcqa.futuredial.com",
# }
client = APIClient(**SSO_API_AUTH_SETTING)
