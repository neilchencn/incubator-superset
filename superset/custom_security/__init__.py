import os

remote_sso_url_prefix = "/restapi/sso/"
REMOTE_REQUEST_TOKEN_URL = os.path.join(remote_sso_url_prefix, "reqeusttoken/")
REMOTE_AUTH_TOKEN_URL = os.path.join(remote_sso_url_prefix, "authtoken/")
REMOTE_SSO_LOGIN_URL = os.path.join(remote_sso_url_prefix, "login/")
