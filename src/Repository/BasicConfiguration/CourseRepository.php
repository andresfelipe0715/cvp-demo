<?php

namespace App\Repository\BasicConfiguration;


use Doctrine\DBAL\Exception;
use Doctrine\DBAL\Connection;

class CourseRepository
{
    private Connection $connection;

    public function __construct(Connection $connection)
    {
        $this->connection = $connection;
    }

    public function checkNameExists(string $name, int $id_program, ?int $id = null): bool
    {
        $name = trim($name);
        // Construct the raw SQL query
        $sql = 'SELECT COUNT(*) AS count
                FROM course
                WHERE LOWER(name) = LOWER(:name) AND id_program = :id_program';
        
        // If updating, exclude the current modulo's ID from the check
        if ($id !== null) {
            $sql .= ' AND id != :id';
        }
    
        // Prepare the query
        $stmt = $this->connection->prepare($sql);
    
        // Bind parameters
        $stmt->bindValue('name', $name);
        $stmt->bindValue('id_program', $id_program);
        if ($id !== null) {
            $stmt->bindValue('id', $id); // Only bind the id (course) parameter if it's an update
        }
    
        // Execute the query
        $result = $stmt->executeQuery()->fetchAssociative();
    
        // Return true if any record matches, false otherwise
        return $result['count'] > 0;
    }
    

 public function insertCourse(string $name, int $id_program, string $expert_id, string $semester, string $credit_number): void
{
    $name = trim($name); 
    $sql = "INSERT INTO course (name, id_program, user_id, semester, credit_number) 
            VALUES (:name, :id_program, :expert_id, :semester, :credit_number)";

    try {
        $stmt = $this->connection->prepare($sql);
        $stmt->bindValue('name', $name);
        $stmt->bindValue('id_program', $id_program);
        $stmt->bindValue('expert_id', $expert_id);
        $stmt->bindValue('semester', $semester);
        $stmt->bindValue('credit_number', $credit_number);
        $stmt->executeStatement();
    } catch (Exception $e) {
        throw new \RuntimeException('Error inserting the course: ' . $e->getMessage());
    }
}


public function updateCourse(string $name, int $id, string $expert_id, string $semester, string $credit_number): void
{
    $name = trim($name);
    $sql = "UPDATE course 
            SET name = :name, 
                user_id = :expert_id, 
                semester = :semester, 
                credit_number = :credit_number 
            WHERE id = :id";

    try {
        $stmt = $this->connection->prepare($sql);
        $stmt->bindValue('name', $name);
        $stmt->bindValue('expert_id', $expert_id);
        $stmt->bindValue('semester', $semester);
        $stmt->bindValue('credit_number', $credit_number);
        $stmt->bindValue('id', $id);
        $stmt->executeStatement();
    } catch (Exception $e) {
        throw new \RuntimeException('Error updating the course: ' . $e->getMessage());
    }
}


public function fetchAllCourses($fromYear, $toYear): array 
{
    $sql = "
        SELECT 
        c.id AS id_course,
        c.name AS course_name,
        c.id_program AS id_program,
        p.name AS program_name,
        c.user_id AS id_expert,
        u.name AS name_expert,
        NULL AS semester,
        c.date AS date,
        c.credit_number AS credit_number
    FROM course c
    JOIN program p ON c.id_program = p.id
    LEFT JOIN users u ON c.user_id = u.id
    WHERE EXTRACT(YEAR FROM c.date) BETWEEN :fromYear AND :toYear
    ORDER BY c.id DESC";

    return $this->connection->fetchAllAssociative($sql, ['fromYear'=> $fromYear, 'toYear' => $toYear]);
}
public function fetchCourseByIds($id_program, $id_course): array 
{
    $sql = "
        SELECT 
            c.id AS id_course, 
            c.name AS name_course, 
            c.id_program AS id_program, 
            p.name AS name_program,
            c.user_id AS id_expert,
            u.name AS name_expert,
            c.semester,
            c.credit_number
        FROM course c
        JOIN program p ON c.id_program = p.id
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.id_program = :id_program AND c.id = :id_course";

    return $this->connection->fetchAssociative($sql, [
        'id_program' => $id_program,
        'id_course' => $id_course
    ]);
}
    public function deleteCourse(int $id): void
    {
        $sql = "DELETE FROM course WHERE id = :id";

        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->bindValue('id', $id); // Binding the course's id
            $stmt->executeStatement();
        } catch (Exception $e) {
            throw new \RuntimeException('Error deleting the course: ' . $e->getMessage());
        }
    }

    public function fetchCoursesByProgram(int $id_program): array
{
    $sql = '
        SELECT 
            c.id AS id_course, 
            c.name AS name_course, 
            p.name AS name_program, 
            c.semester, 
            c.credit_number
            FROM course c
            JOIN program p ON c.id_program = p.id
            WHERE c.id_program = :id_program
            ORDER BY c.name
    ';

    $resultSet = $this->connection->executeQuery($sql, ['id_program' => $id_program]);

    return $resultSet->fetchAllAssociative();
}

}
