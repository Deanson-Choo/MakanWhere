import { query } from '../lib/db.js';

export async function findUserByEmail(email) {
    const text = `
        SELECT *
        FROM Users
        WHERE email = $1
    `;
    const values = [email];
    
    const { rows } = await query(text, values);
    return rows[0]; // Should have only one user with a given email, so return the first row
}

export async function findUserByUsername(username) {
    const text = `
        SELECT *
        FROM Users
        WHERE username = $1
    `;

    const values = [username];
    const { rows } = await query(text, values);
    return rows[0]; // Should have only one user with a given username, so return the first row
}

export async function findUserById(id) {
    const text = `
        SELECT *
        FROM Users
        WHERE id = $1
    `;

    const values = [id];
    const { rows } = await query(text, values);
    return rows[0]; // Should have only one user with a given id, so return the first row
}

export async function createUser(username, email, hashedPassword) {
    const text = `
        INSERT INTO Users (username, email, password)
        VALUES ($1, $2, $3)
        RETURNING id, username, email
    `;

    const values = [username, email, hashedPassword];
    const { rows } = await query(text, values);
    return rows[0]; // Return the newly created user
}

export async function updateUser(id, username, email, hashedPassword, refreshToken) {
    const text = `
        UPDATE Users
        SET username = COALESCE($1, username),
            email = COALESCE($2, email),
            password = COALESCE($3, password),
            refresh_token = COALESCE($4, refresh_token)
        WHERE id = $5
        RETURNING id, username, email
    `;

    const values = [username ?? null, email ?? null, hashedPassword ?? null, refreshToken ?? null, id];
    const { rows } = await query(text, values);
    return rows[0]; // Return the updated user
}

export async function clearRefreshToken(id) {
    const text = `
        UPDATE Users
        SET refresh_token = NULL
        WHERE id = $1
    `;

    const values = [id];
    await query(text, values);
}

export async function deleteUser(id) {
    const text = `
        DELETE FROM Users
        WHERE id = $1
    `;

    const values = [id];
    await query(text, values);
}
