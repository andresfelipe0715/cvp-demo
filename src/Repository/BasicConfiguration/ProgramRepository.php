<?php

namespace App\Repository\BasicConfiguration;


use Doctrine\DBAL\Exception;
use Doctrine\DBAL\Connection;

class ProgramRepository
{
    private Connection $connection;

    public function __construct(Connection $connection)
    {
        $this->connection = $connection;
    }

    public function insertProgram(string $name, ?int $idFaculty): void
{
    $name = trim($name);
    
    $sql = "INSERT INTO program (name, id_faculty) VALUES (:name, :id_faculty)";

    try {
        $stmt = $this->connection->prepare($sql);
        $stmt->bindValue('name', $name);
        $stmt->bindValue('id_faculty', $idFaculty); // Bind id_facultad
        $stmt->executeStatement();
    } catch (Exception $e) {
        throw new \RuntimeException('Error inserting program: ' . $e->getMessage());
    }
}
public function checkIfProgramaExists($name, $id = null): bool
{
    $name = trim($name);
    // Construct the raw SQL query
    $sql = 'SELECT COUNT(*) AS count
            FROM program
            WHERE LOWER(name) = LOWER(:name)';
    
    // If we are updating, exclude the current program's ID from the check
    if ($id !== null) {
        $sql .= ' AND id != :id';
    }

    // Execute the raw query using Doctrine DBAL
    
    $stmt = $this->connection->prepare($sql);
    
    // Bind parameters
    $stmt->bindValue('name', $name);
    if ($id !== null) {
        $stmt->bindValue('id', $id); // Only bind the id parameter if it's an update
    }

    // Execute the query
    $result = $stmt->executeQuery();
    
    // Check if a row is returned
    $row = $result->fetchAssociative();
    $count = $row['count'];
    // Return true if any row is returned, meaning a duplicate exists
    return $count > 0;
}
public function updateProgram(string $name, int $id, ?int $idFaculty): void
{
    $name = trim($name);
    $sql = "UPDATE program SET name = :name, id_faculty = :id_faculty WHERE id = :id";

    try {
        $stmt = $this->connection->prepare($sql);
        $stmt->bindValue('name', $name);
        $stmt->bindValue('id_faculty', $idFaculty); // Bind id_facultad for update
        $stmt->bindValue('id', $id);
        $stmt->executeStatement();
    } catch (Exception $e) {
        throw new \RuntimeException('Error updating program: ' . $e->getMessage());
    }
}

public function fetchAllProgramsTable($fromYear, $toYear): array
{
    $sql = "
        SELECT p.*, f.name AS faculty_name
        FROM program p
        LEFT JOIN faculty f ON p.id_faculty = f.id_faculty
        WHERE EXTRACT(YEAR FROM p.date) BETWEEN :fromYear AND :toYear
        ORDER BY id desc
    ";

    return $this->connection->fetchAllAssociative($sql, ['fromYear'=> $fromYear, 'toYear' => $toYear]);
}

       public function fetchAllProgramas($fromYear, $toYear): array
{
    $sql = "
        SELECT p.*, f.name AS faculty_name
        FROM program p
        LEFT JOIN faculty f ON p.id_faculty = f.id_faculty
        WHERE EXTRACT(YEAR FROM p.date) BETWEEN :fromYear AND :toYear
        ORDER BY p.name asc
    ";

    return $this->connection->fetchAllAssociative($sql, ['fromYear'=> $fromYear, 'toYear' => $toYear]);
}

    public function fetchProgramaById($id): array
{
    $sql = "SELECT * FROM program WHERE id = :id"; // Add WHERE clause to filter by id_programa

    return $this->connection->fetchAssociative($sql, ['id' => $id]); // Use fetchAssociative for a single result
}

    public function deleteProgram(int $id): void
{
    $sql = "DELETE FROM program WHERE id = :id";

    try {
        $stmt = $this->connection->prepare($sql);
        $stmt->bindValue('id', $id); // Bind the id
        $stmt->executeQuery();
    } catch (Exception $e) {
        throw new \RuntimeException('Error deleting the programa: ' . $e->getMessage());
    }
}
public function fetchAllFacultades(): array
{
    $sql = "SELECT * FROM faculty"; // Query to get all faculties

    try {
        return $this->connection->fetchAllAssociative($sql);
    } catch (Exception $e) {
        throw new \RuntimeException('Error fetching facultades: ' . $e->getMessage());
    }
}

}