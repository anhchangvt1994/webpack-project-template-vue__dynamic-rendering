interface ImportMeta {
    env: Env;
}

interface Env {
    PORT:                        number;
    IO_PORT:                     number;
    LOCAL_ADDRESS:               string;
    LOCAL_HOST:                  string;
    IPV4_ADDRESS:                string;
    IPV4_HOST:                   string;
    IO_HOST:                     string;
    ROUTER_BASE_PATH:            string;
    ROUTER_HOME_NAME:            string;
    ROUTER_HOME_PATH:            string;
    ROUTER_CONTENT_NAME:         string;
    ROUTER_CONTENT_PATH:         string;
    ROUTER_CONTENT_COMMENT_NAME: string;
    ROUTER_CONTENT_COMMENT_PATH: string;
    ROUTER_COMMENT_NAME:         string;
    ROUTER_COMMENT_PATH:         string;
    ROUTER_LOGIN_NAME:           string;
    ROUTER_LOGIN_PATH:           string;
    ROUTER_NOT_FOUND_NAME:       string;
    ROUTER_NOT_FOUND_PATH:       string;
    GENERAL_GREETING:            string;
    STORE_KEY_USER:              string;
}
