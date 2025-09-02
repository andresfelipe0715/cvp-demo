<?php

namespace App\Repository\BasicConfiguration;


use Doctrine\DBAL\Exception;
use Doctrine\DBAL\Connection;

class UnitRepository
{
    private Connection $connection;

    public function __construct(Connection $connection)
    {
        $this->connection = $connection;
    }

    public function insertUnits(array $units, int $id_program, int $id_course): void
{
    $sql = "INSERT INTO unit (name, id_course, id_program) 
            VALUES (:name, :id_course, :id_program)";
    $this->connection->beginTransaction();

    try {
        $stmt = $this->connection->prepare($sql);

        foreach ($units as $unitData) {
            $name = trim($unitData['name']);
            $stmt->bindValue('name', $name);
            $stmt->bindValue('id_program', $id_program);
            $stmt->bindValue('id_course', $id_course);
            $stmt->executeStatement();
        }

        $this->connection->commit();
    } catch (\Exception $e) {
        $this->connection->rollBack();
        throw new \RuntimeException('Error inserting units: ' . $e->getMessage());
    }
}
public function checkUnitExists(string $name, int $program_id, int $course_id, ?int $unit_id = null): bool
{
    $name = trim($name);

    // Build the SQL query
    $sql = 'SELECT COUNT(*) AS count
            FROM unit
            WHERE LOWER(name) = LOWER(:name) 
              AND id_program = :id_program
              AND id_course = :id_course';

    // Exclude the current unit if we are editing
    if ($unit_id !== null) {
        $sql .= ' AND id != :unit_id';
    }

    // Prepare and bind parameters
    $stmt = $this->connection->prepare($sql);
    $stmt->bindValue('name', $name);
    $stmt->bindValue('id_program', $program_id);
    $stmt->bindValue('id_course', $course_id);

    if ($unit_id !== null) {
        $stmt->bindValue('unit_id', $unit_id);
    }

    // Execute the query
    $result = $stmt->executeQuery();

    // Fetch the result
    $row = $result->fetchAssociative();
    return $row['count'] > 0;
}
public function isModuleApproved(int $idModulo, int $idPrograma): bool
{
    

    $sql = "
        SELECT aprobacion_experto, aprobacion_admin
        FROM acta
        WHERE id_modulo = :id_modulo
          AND id_programa = :id_programa
        LIMIT 1;
    ";

    $stmt = $this->connection->prepare($sql);
    $stmt->bindValue('id_modulo', $idModulo);
    $stmt->bindValue('id_programa', $idPrograma);

    $result = $stmt->executeQuery();

    // Fetch the result as an associative array
    $result2 = $result->fetchAssociative();
    
    // Check if the result exists and both approval fields are set to '1'
    if ($result2 && $result2['aprobacion_experto'] === '1' && $result2['aprobacion_admin'] === '1') {
        return true;
    }

    // Return false if no result or conditions are not met
    return false;
}

public function updateUnits(array $units): void
{
    $sql = "UPDATE unit 
            SET name = :name 
            WHERE id = :id";
    $this->connection->beginTransaction();

    try {
        $stmt = $this->connection->prepare($sql);

        foreach ($units as $unit) {
            $id = $unit['id'] ?? null;
            $name = $unit['name'] ?? null;

            if ($id === null || $name === null) {
                throw new \RuntimeException('Invalid unit data for update.');
            }

            $name = trim($name);

            // Bind the parameters
            $stmt->bindValue('name', $name);
            $stmt->bindValue('id', $id);

            $stmt->executeStatement();
        }

        $this->connection->commit();
    } catch (\Exception $e) {
        $this->connection->rollBack();
        throw new \RuntimeException('Error updating the units: ' . $e->getMessage());
    }
}


public function deleteUnit(int $id): void
{
    $sql = "DELETE FROM unit WHERE id = :id";

    try {
        $stmt = $this->connection->prepare($sql);
        $stmt->bindValue('id', $id);
        $stmt->executeStatement();
    } catch (\Exception $e) {
        throw new \RuntimeException('Error deleting the unit: ' . $e->getMessage());
    }
}




    public function fetchAllUnits($fromYear, $toYear): array
    {
        $sql = "
            SELECT 
                u.id AS unit_id,
                u.name AS unit_name,
                u.id_program,
                u.date AS unit_date,
                p.name AS program_name,
                u.id_course,
                c.name AS course_name
            FROM 
                unit u
            JOIN 
                course c ON u.id_course = c.id AND u.id_program = c.id_program
            JOIN 
                program p ON u.id_program = p.id
            WHERE 
                EXTRACT(YEAR FROM u.date) BETWEEN :fromYear AND :toYear
            ORDER BY 
                u.id DESC";
            

        try {
            return $this->connection->fetchAllAssociative($sql,['fromYear'=> $fromYear, 'toYear' => $toYear]);
        } catch (Exception $e) {
            throw new \RuntimeException('Error fetching unidades: ' . $e->getMessage());
        }
    }


    public function fetchUnidadByIds($id_programa, $id_modulo, $id_unidad): array
{
    // SQL query with placeholders for the IDs
    $sql = "
        SELECT 
            u.id_unidad, 
            u.nombre AS unidad_nombre, 
            u.id_programa, 
            p.nombre AS programa_nombre, 
            u.id_modulo, 
            m.nombre AS modulo_nombre
        FROM 
            unidad u
        JOIN 
            modulo m ON u.id_modulo = m.id_modulo AND u.id_programa = m.id_programa
        JOIN 
            programa p ON u.id_programa = p.id_programa
        WHERE 
            u.id_programa = :id_programa 
            AND u.id_modulo = :id_modulo
            AND u.id_unidad = :id_unidad
    ";

    try {
        // Fetch the result by binding the parameters to the placeholders in the SQL query
        return $this->connection->fetchAssociative($sql, [
            'id_programa' => $id_programa,
            'id_modulo' => $id_modulo,
            'id_unidad' => $id_unidad
        ]);
    } catch (Exception $e) {
        throw new \RuntimeException('Error fetching unidades: ' . $e->getMessage());
    }
}


   public function fetchUnitsByCourse(int $course_id): array
{
    $sql = 'SELECT id, name
            FROM unit
            WHERE id_course = :id_course
            ORDER BY id ASC';

    // Use executeQuery with parameters
    $resultSet = $this->connection->executeQuery($sql, ['id_course' => $course_id]);

    // Fetch all results as associative array
    return $resultSet->fetchAllAssociative();
}
    
}
