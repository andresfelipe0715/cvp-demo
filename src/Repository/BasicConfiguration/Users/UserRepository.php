<?php

namespace App\Repository\BasicConfiguration\Users;


use Doctrine\DBAL\Connection;


class UserRepository
{
    private $connection;

    public function __construct(Connection $connection)
    {
        $this->connection = $connection;
    }

    public function findExpertUsers($role): array
    {
        $sql = 'SELECT id, id_roles, email, name, status
        FROM users
        WHERE id_roles::text LIKE :role
        ORDER BY name ASC';

        $stmt = $this->connection->executeQuery($sql, ['role' => "%\"$role\"%"]);

        return $stmt->fetchAllAssociative();

    }

    public function insertNewUser($id, $password, $id_roles, $name, $email, $status, $id_title): void
    {
        // Ensure id_roles is in JSON format
        $id_roles_json = json_encode([$id_roles]);

        // Prepare the password
        if (empty($password)) {
            $passwordHash = null; // Set to NULL if the password is not provided or empty
        } else {
            $passwordHash = hash('sha256', $password); // Hash the password if it's provided
        }

        $sql = 'INSERT INTO users (id, password, id_roles, name, email, status, id_title) 
            VALUES (:id, :password, :id_roles, :name, :email, :status, :id_title)';

        $this->connection->executeStatement($sql, [
            'id' => $id,
            'password' => $passwordHash, // Use the prepared password value
            'id_roles' => $id_roles_json, // Pass as JSON
            'name' => $name,
            'email' => $email,
            'status' => $status ?? 'ap',
            'id_title' => $id_title,
        ]);
    }



    public function updateUser($id, $password, $id_roles, $name, $email, $status, $id_title): bool
    {
        // Prepare the SQL update statement
        $sql = 'UPDATE users 
            SET 
                password = :password,
                id_roles = :id_roles,
                name = :name,
                email = :email,
                status = :status,
                id_title = :id_title
            WHERE 
                id = :id';

        // Ensure id_roles is in JSON format
        $id_roles_json = json_encode([$id_roles]);

        // Prepare the parameters
        $params = [
            'id' => $id,
            'id_roles' => $id_roles_json, // Pass as JSON
            'name' => $name,
            'email' => $email,
            'status' => $status ?? 'ap',
            'id_title' => $id_title,
        ];

        // Set password to NULL if it's not provided or empty
        if (empty($password)) {
            $params['password'] = null; // This will set the password column to NULL
        } else {
            $params['password'] = hash('sha256', $password); // Hash the password if it's provided
        }

        // Execute the update statement
        $result = $this->connection->executeStatement($sql, $params);

        // Return true if the user was updated, otherwise false
        return $result > 0; // The result indicates the number of affected rows
    }

    public function findAllRoles(): array
    {
        $sql = 'SELECT id_roles, nombre FROM roles';
        $stmt = $this->connection->executeQuery($sql);

        return $stmt->fetchAllAssociative(); // Fetch all roles as an associative array
    }



    public function findAllTitles(): array
    {
        $sql = 'SELECT id_title, title_name FROM user_titles';
        $stmt = $this->connection->executeQuery($sql);

        return $stmt->fetchAllAssociative(); // Fetch all titles as an associative array
    }

    public function findAllUsers(): array
    {
        $sql = 'SELECT 
        u.id,
        u.name,
        u.email,
        u.status,
        u.title,
        ut.title_name,
        u.id_roles,
        r.name AS role_name
        FROM 
            users u
        LEFT JOIN 
            user_titles ut ON u.title = ut.id
        LEFT JOIN 
        roles r ON r.id = ANY (SELECT json_array_elements_text(u.id_roles::json))';
            $stmt = $this->connection->executeQuery($sql);
            return $stmt->fetchAllAssociative();

    }

    public function fetchUserByID($documento): array
    {
        $sql = 'SELECT 
    a.documento,
    a.name,
    a.email,
    a.estado,
    a.id_title,
    ut.title_name,
    a.id_roles,
    r.nombre AS role_name
FROM 
    aval a
LEFT JOIN 
    user_titles ut ON a.id_title = ut.id_title
LEFT JOIN 
    roles r ON r.id_roles = ANY (SELECT json_array_elements_text(a.id_roles::json))
WHERE 
    a.documento = :documento';
        $stmt = $this->connection->executeQuery($sql, ['documento' => $documento]);
        return $stmt->fetchAssociative();

    }
    public function findNameAndTitleByDocumento($data): array
    {
        $sql = 'SELECT a.name, ut.title_name 
            FROM aval a
            LEFT JOIN user_titles ut ON a.id_title = ut.id_title
            WHERE a.documento = :documento';
        $stmt = $this->connection->executeQuery($sql, ['documento' => $data['documento']]);
        return $stmt->fetchAssociative();
    }


        public function findNameAndTitleByID(array $criteria): ?array
    {
        $sql = '
            SELECT 
                u.name,
                ut.title_name
            FROM 
                users u
            LEFT JOIN 
                user_titles ut ON u.title = ut.id
            WHERE 
                u.id = :id
            LIMIT 1
        ';

        $stmt = $this->connection->prepare($sql);
        $stmt->bindValue('id', $criteria['id']);
        $result = $stmt->executeQuery()->fetchAssociative();

        return $result ?: null;
    }
}