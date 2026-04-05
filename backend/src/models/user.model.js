import { query } from '../lib/db.js';

export async function findUserByEmail(email) {
    const text = `
        SELECT *
        FROM "User"
        WHERE email = $1
    `;
    const values = [email];
    
    const { rows } = await query(text, values);
    return rows[0]; // Should allow have only one user with a given email, so return the first row
}

export async function findUserByUsername(username) {
    const text = `
        SELECT *
        FROM "User"
        WHERE username = $1
    `;

    const values = [username];
    const { rows } = await query(text, values);
    return rows[0]; // Should allow have only one user with a given username, so return the first row
}

export async function findUserById(id) {
    const text = `
        SELECT *
        FROM "User"
        WHERE id = $1
    `;

    const values = [id];
    const { rows } = await query(text, values);
    return rows[0]; // Should allow have only one user with a given id, so return the first row
}

export async function createUser(username, email, hashedPassword) {
    const text = `
        INSERT INTO "User" (username, email, password)
        VALUES ($1, $2, $3)
        RETURNING id, username, email
    `;

    const values = [username, email, hashedPassword];
    const { rows } = await query(text, values);
    return rows[0]; // Return the newly created user
}

export async function updateUser(id, username, email, hashedPassword) {
    const text = `
        UPDATE "User"
        SET username = COALESCE($1, username),
            email = COALESCE($2, email),
            password = COALESCE($3, password)
        WHERE id = $4
        RETURNING id, username, email
    `;

    const values = [username ?? null, email ?? null, hashedPassword ?? null, id];
    const { rows } = await query(text, values);
    return rows[0]; // Return the updated user
}
