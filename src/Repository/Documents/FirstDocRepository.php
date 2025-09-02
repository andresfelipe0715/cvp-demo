<?php

namespace App\Repository\Documents;

use Doctrine\DBAL\Connection;


class FirstDocRepository
{
    private $connection;

    public function __construct(Connection $connection)
    {
        $this->connection = $connection;
    }

    public function insertIntoDoc(array $requestData): int
        {
            $submitDate = new \DateTime($requestData['submitDate']);
            $idCourse = $requestData['id_course']; // This should be id_course
            $idProgram = $requestData['id_program'];
            $ped_approved = $requestData['ped_approved'] ?? null;
            $comu_approved = $requestData['com_approved'] ?? null;

            $doc = 1; // Changed to 4 to match the DEFAULT in form_1 table definition

            $sql = "
                INSERT INTO form_1 (
                    id_course, id_program, id_format, approval_pedagogical, approval_communication, submission_date
                ) 
                VALUES (
                    :idCourse, :idProgram, :idFormat, :approvalPedagogical, :approvalCommunication, :submissionDate
                )";

            $stmt = $this->connection->prepare($sql);
            $stmt->bindValue('idCourse', $idCourse); // Binding the value that represents the course ID
            $stmt->bindValue('idProgram', $idProgram);
            $stmt->bindValue('idFormat', $doc);
            $stmt->bindValue('approvalPedagogical', $ped_approved);
            $stmt->bindValue('approvalCommunication', $comu_approved);
            $stmt->bindValue('submissionDate', $submitDate->format('Y-m-d'));
            $stmt->executeQuery();
            
            return $this->connection->lastInsertId();
        }

    public function insertIntoDimenPedagogical(array $data): int
    {   
        $sql = "
            INSERT INTO feco_dimen_pedagogica (fedp_fecha, fedp_aprobacion, fedp_observacion, fedp_archivos, fedp_revision)
            VALUES (:date, :approved, :observation, :files, :reviewNumber)";

        $stmt = $this->connection->prepare($sql);
        $stmt->bindValue('date', $data['date']);
        $stmt->bindValue('approved', $data['approved']);
        $stmt->bindValue('observation', $data['observation']);
        $stmt->bindValue('files', $data['files']);
        $stmt->bindValue('reviewNumber', $data['reviewNumber']);
        $stmt->executeQuery();
        
        return $this->connection->lastInsertId();
    }

    public function insertIntoDimenComu(array $data): int
    {
        $sql = "
            INSERT INTO feco_dimen_comunicativa (fedc_fecha, fedc_aprobacion, fedc_observacion, fedc_archivos, fedc_revision)
            VALUES (:date, :approved, :observation, :files, :reviewNumber)";

        $stmt = $this->connection->prepare($sql);
         $stmt->bindValue('date', $data['date']);
        $stmt->bindValue('approved', $data['approved']);
        $stmt->bindValue('observation', $data['observation']);
        $stmt->bindValue('files', $data['files']);
        $stmt->bindValue('reviewNumber', $data['reviewNumber']);
        $stmt->executeQuery();

        return $this->connection->lastInsertId();
    }

    public function insertIntoUnidadDimension(array $data): void
    {
        $sql = "
            INSERT INTO feco_unidad_dimension (fedp_id, fedc_id, id_unidad, id_modulo, id_programa, feco_id, aprobacion)
            VALUES (:fedp_id, :fedc_id, :id_unidad, :id_modulo, :id_programa, :feco_id, :aprobacion)";

        $stmt = $this->connection->prepare($sql);
        $stmt->bindValue('fedp_id', $data['fedp_id']);
        $stmt->bindValue('fedc_id', $data['fedc_id']);
        $stmt->bindValue('id_unidad', $data['id_unidad']);
        $stmt->bindValue('id_modulo', $data['id_modulo']);
        $stmt->bindValue('id_programa', $data['id_programa']);
        $stmt->bindValue('feco_id', $data['feco_id']);
        $stmt->bindValue('aprobacion', $data['aprobacion']);
        $stmt->executeQuery();
    }

    public function insertOrUpdateUnitDimension(array $data): void
{
    // First, check if a record already exists for this combination
    // We need to check using the unit's composite key AND the form_1 id
    $sql = "
        SELECT id_form_1_unit_dimension, fedp_id, fedc_id
        FROM form_unit_dimension
        WHERE id_unit = :id_unit 
          AND id_course = :id_course 
          AND id_program = :id_program
          AND id_form_1 = :id_form_1
    ";
    $stmt = $this->connection->prepare($sql);
    $stmt->bindValue('id_unit', $data['id_unit']);
    $stmt->bindValue('id_course', $data['id_course']); // id_course is the course id
    $stmt->bindValue('id_program', $data['id_program']);
    $stmt->bindValue('id_form_1', $data['id_form_1']);   // The form_1 id is the new foreign key
    $result = $stmt->executeQuery()->fetchAssociative();

    if ($result) {
        // If record exists, update the `fedp_id` or `fedc_id` if they're provided
        $updateSql = "
            UPDATE form_unit_dimension
            SET 
                fedp_id = COALESCE(:fedp_id, fedp_id),
                fedc_id = COALESCE(:fedc_id, fedc_id)
            WHERE id_form_1_unit_dimension = :id_form_1_unit_dimension
        ";
        $stmt = $this->connection->prepare($updateSql);
        $stmt->bindValue('fedp_id', $data['fedp_id']);
        $stmt->bindValue('fedc_id', $data['fedc_id']);
        $stmt->bindValue('id_form_1_unit_dimension', $result['id_form_1_unit_dimension']); // Use the found PK
        $stmt->executeStatement();
    } else {
        // If no record exists, insert a new one
        // Note: The 'feco_id' from the old table is now 'id_form_1'
        $insertSql = "
            INSERT INTO form_unit_dimension 
                (fedp_id, fedc_id, id_unit, id_course, id_program, id_form_1)
            VALUES 
                (:fedp_id, :fedc_id, :id_unit, :id_course, :id_program, :id_form_1)
        ";
        $stmt = $this->connection->prepare($insertSql);
        $stmt->bindValue('fedp_id', $data['fedp_id']);
        $stmt->bindValue('fedc_id', $data['fedc_id']);
        $stmt->bindValue('id_unit', $data['id_unit']);
        $stmt->bindValue('id_course', $data['id_course']); // id_course is the course id
        $stmt->bindValue('id_program', $data['id_program']);
        $stmt->bindValue('id_form_1', $data['id_form_1']);   // The form_1 id is the new foreign key
        $stmt->executeStatement();
    }
}

    // New methods for fetching existing data
    public function getPedagogicalData($unit, $program, $course): ?array
{
    $sql = "
        SELECT fedp_id, fedp_fecha, fedp_aprobacion, fedp_observacion, fedp_archivos, fedp_revision
        FROM feco_dimen_pedagogica
        WHERE fedp_id = (
            SELECT fud.fedp_id
            FROM form_unit_dimension fud
            WHERE fud.id_unit = :id_unit
              AND fud.id_program = :id_program
              AND fud.id_course = :id_course
        )
    ";
    
    $stmt = $this->connection->prepare($sql);
    $stmt->bindValue('id_unit', $unit);
    $stmt->bindValue('id_program', $program);
    $stmt->bindValue('id_course', $course); 
    $result = $stmt->executeQuery()->fetchAssociative();
    return $result === false ? null : $result;
}

    public function getCommunicativeData($unit, $program, $course): ?array
{
    $sql = "
        SELECT fedc_id, fedc_fecha, fedc_aprobacion, fedc_observacion, fedc_archivos, fedc_revision
        FROM feco_dimen_comunicativa
        WHERE fedc_id = (
            SELECT fud.fedc_id
            FROM form_unit_dimension fud
            WHERE fud.id_unit = :id_unit 
              AND fud.id_program = :id_program
              AND fud.id_course = :id_course
            
        )
    ";
    
    $stmt = $this->connection->prepare($sql);
    $stmt->bindValue('id_unit', $unit);
    $stmt->bindValue('id_program', $program);
    $stmt->bindValue('id_course', $course); // This is the course ID
    $result = $stmt->executeQuery()->fetchAssociative();
    return $result === false ? null : $result;
}

    public function hasRegisteredInfo($program, $course): bool
{
    $sql = "
        SELECT COUNT(*) 
        FROM form_1 
        WHERE id_program = :program AND id_course = :course
    ";
    
    $stmt = $this->connection->prepare($sql);
    $stmt->bindValue('program', $program);
    $stmt->bindValue('course', $course); // This is the course ID

    // Fetch the result as an associative array
    $row = $stmt->executeQuery()->fetchAssociative();

    // Access the count and return true if it's greater than 0, false otherwise
    return (int) $row['count'] > 0;
}



public function selectAllFormats($fromYear, $toYear): array
{
    $sql = "
        SELECT 
            f1.id_form_1 AS feco_id, 
            f1.id_course AS course_id, 
            f1.id_program AS program_id, 
            f1.id_format AS id_formato, 
            f1.submission_date AS fecha_entrega, 
            f1.last_modified,
            c.name AS modulo_nombre, 
            p.name AS programa_nombre,
            f1.id_format AS id_formato -- This was duplicated in the original SELECT
        FROM form_1 AS f1
        INNER JOIN process pr ON f1.id_course = pr.id_course 
            AND f1.id_program = pr.id_program 
            AND f1.id_format = pr.id_format
        INNER JOIN course c ON f1.id_course = c.id AND f1.id_program = c.id_program
        INNER JOIN program p ON c.id_program = p.id
        WHERE EXTRACT(YEAR FROM f1.submission_date) BETWEEN :fromYear AND :toYear
        ORDER BY f1.id_form_1 DESC
    ";

    return $this->connection->fetchAllAssociative($sql, ['fromYear' => $fromYear, 'toYear' => $toYear]);
}


public function getDocData($program_id, $course_id, $feco_id): array
{
    // Debugging the input parameters

    $sql = "
        SELECT 
            f1.id_form_1 AS feco_id,
            f1.id_course AS id_course,
            f1.id_program AS id_program,
            f1.id_format AS id_format,
            f1.approval_pedagogical AS peda_approval,
            f1.approval_communication AS comu_approval,
            f1.submission_date AS submitDate,
            fdp.fedp_id,
            fdp.fedp_fecha,
            fdp.fedp_aprobacion,
            fdp.fedp_revision,
            fdp.fedp_observacion,
            fdp.fedp_archivos,
            fdc.fedc_id,
            fdc.fedc_fecha,
            fdc.fedc_aprobacion,
            fdc.fedc_revision,
            fdc.fedc_observacion,
            fdc.fedc_archivos,
            fud.id_form_1_unit_dimension AS fudi_id,
            fud.id_unit AS id_unit
        FROM 
            form_1 f1
        LEFT JOIN 
            form_unit_dimension fud ON f1.id_form_1 = fud.id_form_1
        LEFT JOIN 
            feco_dimen_pedagogica fdp ON fud.fedp_id = fdp.fedp_id
        LEFT JOIN 
            feco_dimen_comunicativa fdc ON fud.fedc_id = fdc.fedc_id
        WHERE
            f1.id_program = :program_id 
            AND f1.id_course = :course_id 
            AND f1.id_form_1 = :feco_id
    ";

    $stmt = $this->connection->prepare($sql);
    $stmt->bindValue('program_id', $program_id);
    $stmt->bindValue('course_id', $course_id); // This is the course ID
    $stmt->bindValue('feco_id', $feco_id);

    // Execute the query and fetch results
    $result = $stmt->executeQuery()->fetchAllAssociative();

    // Log the result
    error_log("Query Result: " . print_r($result, true));

    return $result;
}


public function getPDFFromUpdateData($programa, $modulo, $fecoId): array
{
    // Debugging the input parameters
    error_log("Parameters: id_programa={$programa}, id_modulo={$modulo}, feco_id={$fecoId}");

    $sql = "
    SELECT 
        f1.id_form_1 AS feco_id,
        f1.id_course AS  course_id,
        f1.id_program AS program_id,
        f1.id_format AS format_id,
        f1.approval_pedagogical AS ped_approval,
        f1.approval_communication AS comu_approval,
        f1.submission_date AS submitDate,
        fdp.fedp_id,
        fdp.fedp_fecha,
        fdp.fedp_aprobacion,
        fdp.fedp_revision,
        fdp.fedp_observacion,
        fdp.fedp_archivos,
        fdc.fedc_id,
        fdc.fedc_fecha,
        fdc.fedc_aprobacion,
        fdc.fedc_revision,
        fdc.fedc_observacion,
        fdc.fedc_archivos,
        fud.id_form_1_unit_dimension AS fudi_id,
        fud.id_unit AS id_unidad,
        p.name AS program_name,
        c.name AS course_name,
        avp.name AS name_document_ped,
        avc.name AS name_document_comu,
        avt.name AS name_document_transcript,
        u.name AS unit_name
    FROM 
        form_1 f1
    LEFT JOIN 
        form_unit_dimension fud ON f1.id_form_1 = fud.id_form_1
    LEFT JOIN 
        feco_dimen_pedagogica fdp ON fud.fedp_id = fdp.fedp_id
    LEFT JOIN 
        feco_dimen_comunicativa fdc ON fud.fedc_id = fdc.fedc_id
    LEFT JOIN 
        program p ON f1.id_program = p.id
    LEFT JOIN 
        course c ON f1.id_course = c.id AND f1.id_program = c.id_program
    LEFT JOIN 
        process pr ON f1.id_course = pr.id_course AND f1.id_program = pr.id_program AND f1.id_format = pr.id_format
    LEFT JOIN 
        users avp ON pr.id_user_pedagogical = avp.id
    LEFT JOIN 
        users avc ON pr.id_user_communication = avc.id
    LEFT JOIN
        users avt ON pr.id_user_administrator = avt.id
    LEFT JOIN 
        unit u ON fud.id_unit = u.id AND u.id_course = pr.id_course AND u.id_program = pr.id_program  -- Join with unit
    WHERE
        f1.id_program = :program_id 
        AND f1.id_course = :course_id 
        AND f1.id_form_1 = :feco_id;
    ";

    $stmt = $this->connection->prepare($sql);
    $stmt->bindValue('program_id', $programa);
    $stmt->bindValue('course_id', $modulo); // This is the course ID
    $stmt->bindValue('feco_id', $fecoId);

    // Execute the query and fetch results
    $result = $stmt->executeQuery()->fetchAllAssociative();

    // Log the result
    error_log("Query Result: " . print_r($result, true));

    return $result;
}

public function updatePedagogicalData(array $data): void
{
    $sql = "
        UPDATE feco_dimen_pedagogica
        SET fedp_fecha = :reviewDate,
            fedp_aprobacion = :approved,
            fedp_revision = :reviewNumber,
            fedp_observacion = :observation,
            fedp_archivos = :files
        WHERE fedp_id = :id
    ";

    $stmt = $this->connection->prepare($sql);
     $stmt->bindValue('reviewDate', $data['reviewDate']);
    $stmt->bindValue('approved', $data['approved']);
    $stmt->bindValue('observation', $data['observation']);
    $stmt->bindValue('reviewNumber', $data['reviewNumber']);
    $stmt->bindValue('files', $data['files']);
    $stmt->bindValue('id', $data['id']);
    $stmt->executeQuery();
}

public function updateCommunicativeData(array $data): void
{
    $sql = "
        UPDATE feco_dimen_comunicativa
        SET fedc_fecha = :reviewDate,
            fedc_aprobacion = :approved,
            fedc_revision = :reviewNumber,
            fedc_observacion = :observation,
            fedc_archivos = :files
        WHERE fedc_id = :id
    ";

    $stmt = $this->connection->prepare($sql);
    $stmt->bindValue('reviewDate', $data['reviewDate']);
    $stmt->bindValue('approved', $data['approved']);
    $stmt->bindValue('observation', $data['observation']);
    $stmt->bindValue('reviewNumber', $data['reviewNumber']);
    $stmt->bindValue('files', $data['files']);
    $stmt->bindValue('id', $data['id']);
    $stmt->executeQuery();
}



public function updateFecuApprovalStatus(array $data): void
{
    $sql = "UPDATE form_1
            SET approval_pedagogical = :ped_approval,
                approval_communication = :comu_approval
            WHERE id_program = :id_program
              AND id_course = :id_course
              AND id_format = 1"; 

    $stmt = $this->connection->prepare($sql);
    $stmt->bindValue('ped_approval', $data['ped_approval']);
    $stmt->bindValue('comu_approval', $data['comu_approval']);
    $stmt->bindValue('id_program', $data['id_program']);
    $stmt->bindValue('id_course', $data['id_course']); // This is the course ID
    $stmt->executeQuery();
}

public function getUnidadesByFecoId($feco_id)
{
    $sql = 'SELECT * FROM form_unit_dimension WHERE id_form_1 = :feco_id';

    // Use executeQuery with parameters
    $resultSet = $this->connection->executeQuery($sql, ['feco_id' => $feco_id]);

    // Fetch all results as associative array
    return $resultSet->fetchAllAssociative();
}

public function deleteUnidadDimension($fudi_id) {
    // First, fetch the fedp_id and fedc_id associated with the id_form_1_unit_dimension
    $sql = 'SELECT fedp_id, fedc_id FROM form_unit_dimension WHERE id_form_1_unit_dimension = :fudi_id';
    $resultSet = $this->connection->executeQuery($sql, ['fudi_id' => $fudi_id]);
    $result = $resultSet->fetchAssociative();

    // Check if there's pedagogical data to delete
    if ($result['fedp_id']) {
        $this->deletePedagogicalData($result['fedp_id']);
    }

    // Check if there's communicative data to delete
    if ($result['fedc_id']) {
        $this->deleteCommunicativeData($result['fedc_id']);
    }

    // Finally, delete the unidad dimension entry
    $sql = 'DELETE FROM form_unit_dimension WHERE id_form_1_unit_dimension = :fudi_id';
    $this->connection->executeQuery($sql, ['fudi_id' => $fudi_id]);
}

// These private methods remain unchanged as they use the correct table names
private function deletePedagogicalData($fedp_id) {
    // Delete the pedagogical record
    $sql = 'DELETE FROM feco_dimen_pedagogica WHERE fedp_id = :fedp_id';
    $this->connection->executeQuery($sql, ['fedp_id' => $fedp_id]);
}

private function deleteCommunicativeData($fedc_id) {
    // Delete the communicative record
    $sql = 'DELETE FROM feco_dimen_comunicativa WHERE fedc_id = :fedc_id';
    $this->connection->executeQuery($sql, ['fedc_id' => $fedc_id]);
}









public function hasRegisteredInfoProceso($program, $course): bool
{
    // SQL query to count existing records in 'process'
    $sql = "SELECT COUNT(*) as count FROM process WHERE id_program = :program AND id_course = :course AND id_format = :id_format";
    
    // Execute the query
    $result = $this->connection->fetchAssociative($sql, [
        'program' => $program,
        'course' => $course, // This is the course ID
        'id_format' => 4 // Changed from 1 to 4 to match the DEFAULT in form_1
    ]);
    
    // Check if the count is 0, meaning no record exists
    if ($result['count'] == 0) {
        // If no record, return false so that the controller can proceed to insert
        return false;
    }

    // Otherwise, a record exists, return true
    return true;
}
    // Method to insert into the 'proceso' table
public function insertProceso($program, $course, $doc, $is_approved, $documents)
{
    $sql = "INSERT INTO process (id_course, id_program, id_format, approval, 
            id_user_administrator, id_user_pedagogical, 
            id_user_communication, id_user_expert, 
            id_user_transcriber) 
            VALUES (:course, :program, :doc, :approval, :admin, 
            :ped, :comu, :professor, :transcript)";

    $this->connection->executeStatement($sql, [
        'course' => $course, // This is the course ID
        'program' => $program,
        'doc' => $doc,
        'approval' => $is_approved,
        'admin' => $documents['admin_Id'],
        'ped' => $documents['ped_Id'],
        'comu' => $documents['com_Id'],
        'professor' => $documents['prof_Id'],
        'transcript'=> $documents['transcript_Id'],
    ]);
}



public function updateProcess($program, $course, $doc, $is_approved, $newUserIds)
{
    // Step 1: Fetch existing user IDs from the database
    $sqlSelect = "SELECT id_user_administrator, id_user_pedagogical, 
                         id_user_communication, id_user_expert 
                  FROM process
                  WHERE id_course = :course AND id_program = :program AND id_format = :doc";

    $existingUserIds = $this->connection->fetchAssociative($sqlSelect, [
        'course' => $course, // This is the course ID
        'program' => $program,
        'doc' => $doc,
    ]);

    if (!$existingUserIds) {
        throw new \Exception("No matching record found to update.");
    }

    // Step 2: Use new user IDs if provided, otherwise fall back to existing values
    $idUserAdministrator = $newUserIds['id_user_administrator'] 
        ?? $existingUserIds['id_user_administrator'];
    $idUserPedagogical = $newUserIds['id_user_pedagogical'] 
        ?? $existingUserIds['id_user_pedagogical'];
    $idUserCommunication = $newUserIds['id_user_communication'] 
        ?? $existingUserIds['id_user_communication'];
    $idUserExpert = $newUserIds['id_user_expert'] 
        ?? $existingUserIds['id_user_expert'];

    // Step 3: Perform the update with the correct values
    $sqlUpdate = "UPDATE process 
                  SET approval = :approval, 
                      id_user_administrator = :admin, 
                      id_user_pedagogical = :pedagogical, 
                      id_user_communication = :comu, 
                      id_user_expert = :experto
                  WHERE id_course = :course AND id_program = :program AND id_format = :doc";

    try {
        // Prepare the SQL statement
        $stmt = $this->connection->prepare($sqlUpdate);

        // Bind the values
        $stmt->bindValue(':approval', $is_approved);
        $stmt->bindValue(':admin', $idUserAdministrator);
        $stmt->bindValue(':pedagogical', $idUserPedagogical);
        $stmt->bindValue(':comu', $idUserCommunication);
        $stmt->bindValue(':experto', $idUserExpert);
        $stmt->bindValue(':course', $course);
        $stmt->bindValue(':program', $program);
        $stmt->bindValue(':doc', $doc);

        // Execute the statement
        $stmt->executeStatement();
    } catch (\Exception $e) {
        // Handle exception (log it or rethrow)
        throw new \RuntimeException('Error updating process: ' . $e->getMessage());
    }
}



function transformPDFData(array $data): array
{
    $transformed = [];

    foreach ($data as $item) {

        $submitDate = \DateTime::createFromFormat('Y-m-d', $item['submitdate']);
        $formattedSubmitDate = $submitDate ? $submitDate->format('d-m-Y') : '';
        $key = "{$item['feco_id']}_{$item['course_id']}_{$item['program_id']}_{$formattedSubmitDate}";

        if (!isset($transformed[$key])) {
            $transformed[$key] = [
                'feco_id' => $item['feco_id'],
                'course_id' => $item['course_id'],
                'program_id' => $item['program_id'],
                'program_name' => $item['program_name'],
                'course_name' => $item['course_name'],
                'submitdate' => $formattedSubmitDate,
                'name_document_ped' => $item['name_document_ped'],
                'name_document_comu' => $item['name_document_comu'],
                'name_document_transcript' => $item['name_document_transcript'],
                'ped_approval' => $item['ped_approval'] ?? null,
                'comu_approval' => $item['comu_approval'] ?? null,
                'units' => []
            ];
        }

        $transformed[$key]['units'][] = [
            'fedp_id' => $item['fedp_id'],
            'fedp_fecha' => $item['fedp_fecha'] ? \DateTime::createFromFormat('Y-m-d', $item['fedp_fecha'])->format('d-m-Y') : '',
            'fedp_aprobacion' => $item['fedp_aprobacion'],
            'fedp_revision' => $item['fedp_revision'],
            'fedp_observacion' => $item['fedp_observacion'],
            'fedp_archivos' => $item['fedp_archivos'],
            'fedc_id' => $item['fedc_id'],
            'fedc_fecha' => $item['fedc_fecha'] ? \DateTime::createFromFormat('Y-m-d', $item['fedc_fecha'])->format('d-m-Y') : '',
            'fedc_aprobacion' => $item['fedc_aprobacion'],
            'fedc_revision' => $item['fedc_revision'],
            'fedc_observacion' => $item['fedc_observacion'],
            'fedc_archivos' => $item['fedc_archivos'],
            'fudi_id' => $item['fudi_id'],
            'id_unidad' => $item['id_unidad'],
            'unit_name' => $item['unit_name'],
        ];
    }

    return array_values($transformed);
}





public function isFullyApproved($feco_id)
{
    $sql = '
        SELECT 
            (approval_pedagogical = :approved AND approval_communication = :approved) AS is_approved
        FROM 
            form_1
        WHERE 
            id_form_1 = :feco_id
    ';

    // Execute the query with parameters
    $resultSet = $this->connection->executeQuery($sql, [
        'feco_id' => $feco_id,
        'approved' => '1'
    ]);

    // Fetch the result as an associative array
    $result = $resultSet->fetchAssociative();

    // Return true if both fields are approved, false otherwise
    return !empty($result) && (bool) $result['is_approved'];
}
}