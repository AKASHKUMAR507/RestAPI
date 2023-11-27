class CustomErrorHandler extends Error {
    constructor(status, message){
        super();
        this.stack = status;
        this.message = message;
    }

    static alreadyExists(message){
        return new CustomErrorHandler(409, message);
    }

    static wrongCredentials(message = 'Username or password is wrong!') {
        return new CustomErrorHandler(401, message);
    }

    static unAuthorized(message = 'unAuthorized') {
        return new CustomErrorHandler(401, message);
    }

    static notFound(message = '404 Not Found') {
        return new CustomErrorHandler(404, message);
    }

    static serverError(message = 'Internal server error') {
        return new CustomErrorHandler(500, message);
    }
}

export default CustomErrorHandler