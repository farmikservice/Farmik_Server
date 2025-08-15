export const saveCookie = (token, res) => {
    res.cookie('jwt', token, {
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
        secure : true,
        sameSite : "None"
    })
}