export const login = (token, user) => ({
    type: 'LOGIN',
    payload: {token, user}
});

export const logout = () => ({
    type: 'LOGOUT'
});