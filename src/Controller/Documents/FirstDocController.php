<?php

namespace App\Controller\Documents;

use App\Repository\Documents\FirstDocRepository;
use Doctrine\DBAL\Connection;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Dompdf\Dompdf;
use Dompdf\Options;
use Twig\Environment;
use TCPDF;



#[Route(path: "/document/firstdocument", name: "formularioevaluacion")]
class FirstDocController extends AbstractController
{
    #[Route(path: "/documentpost", name: "documentpost", methods: ["POST"])]
public function f4EvaluacionInsert(Request $request, FirstDocRepository $documentRepository, Connection $connection): JsonResponse
{
    $data = json_decode($request->getContent(), true);

    $type = $data['type'] ?? null;
    $personId = $data['person_Id'] ?? null;
    $program = $data['program'] ?? null;
    $course = $data['course'] ?? null;
    $units = $data['units'] ?? [];
    $pedApproved = $data['approvedPedagogical'] ?? null;
    $comApproved = $data['approvedComunicational'] ?? null;
    $roles = $data['roles'] ?? [];
    $doc = 1;

    $is_approved = ($pedApproved === "1" && $comApproved === "1") ? 'S' : 'N';

    $admin_Id = in_array('admin', $roles) ? $personId : null;
    $ped_Id = in_array('pedagogico', $roles) ? $personId : null;
    $com_Id = in_array('comunicativo', $roles) ? $personId : null;
    $professor_id = in_array('experto', $roles) ? $personId : null;

    try {
        $connection->beginTransaction();

        if ($type === "I") {
            return $this->handleInsert(
                $data, $documentRepository, $connection,
                $program, $course, $units,
                $pedApproved, $comApproved,
                $is_approved, $doc,
                $admin_Id, $ped_Id, $com_Id, $professor_id, $personId
            );
        } elseif ($type === "U") {
            return $this->handleUpdate(
                $data, $documentRepository, $connection,
                $program, $course, $units,
                $is_approved, $doc,
                $admin_Id, $ped_Id, $com_Id, $professor_id
            );
        } else {
            $connection->rollBack();
            return new JsonResponse(['status' => 'error', 'message' => 'Invalid type'], 400);
        }
    } catch (\Exception $e) {
        $connection->rollBack();
        return new JsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
}

private function handleInsert(
    array $data,
    FirstDocRepository $documentRepository,
    Connection $connection,
    $program, $course, array $units,
    $pedApproved, $comApproved,
    $is_approved, $doc,
    $admin_Id, $ped_Id, $com_Id, $professor_id, $personId
): JsonResponse {
    foreach ($units as $unit) {
        if ($documentRepository->hasRegisteredInfo($program, $course)) {
            $connection->rollBack();
            return new JsonResponse(['status' => 'error', 'message' => 'Warning: this form already exists for this program and course.'], 400);
        }
    }

    if (!$documentRepository->hasRegisteredInfoProceso($program, $course)) {
        $documentRepository->insertProceso($program, $course, $doc, $is_approved, [
            'admin_Id' => $admin_Id,
            'ped_Id' => $ped_Id,
            'com_Id' => $com_Id,
            'prof_Id' => $professor_id,
            'transcript_Id' => $personId,
        ]);
    } else {
        $connection->rollBack();
        return new JsonResponse(['status' => 'error', 'message' => 'Este Formato ya existe para este programa y modulo en la tabla proceso.'], 400);
    }

    $requestData = [
        'submitDate' => $data['submitDate'] ?? null,
        'id_program' => $program,
        'id_course' => $course,
        'ped_approved' => $pedApproved,
        'com_approved' => $comApproved,
    ];
    $idFecu = $documentRepository->insertIntoDoc($requestData);

    foreach ($units as $unit) {
        $fedp_id = $documentRepository->insertIntoDimenPedagogical([
            'date' => $unit['pedagogical']['reviewDate'] ?? null,
            'approved' => !empty($unit['pedagogical']['approved']) ? '1' : '0',
            'observation' => $unit['pedagogical']['observation'] ?? '',
            'files' => $unit['pedagogical']['files'] ?? 0,
            'reviewNumber' => $unit['pedagogical']['reviewNumber'] ?? null,
        ]);

        $fedc_id = $documentRepository->insertIntoDimenComu([
            'date' => $unit['comunicational']['reviewDate'] ?? null,
            'approved' => !empty($unit['comunicational']['approved']) ? '1' : '0',
            'observation' => $unit['comunicational']['observation'] ?? '',
            'files' => $unit['comunicational']['files'] ?? 0,
            'reviewNumber' => $unit['comunicational']['reviewNumber'] ?? '',
        ]);

        $documentRepository->insertOrUpdateUnitDimension([
            'fedp_id' => $fedp_id,
            'fedc_id' => $fedc_id,
            'id_unit' => $unit['unit'],
            'id_course' => $course,
            'id_program' => $program,
            'id_form_1' => $idFecu,
        ]);
    }

    $connection->commit();
    return new JsonResponse(['status' => 'Success', 'message' => 'Saved Successfully.'], 200);
}

private function handleUpdate(
    array $data,
    FirstDocRepository $documentRepository,
    Connection $connection,
    $program, $course, array $units,
    $is_approved, $doc,
    $admin_Id, $ped_Id, $com_Id, $professor_id
): JsonResponse {
    $documentRepository->updateProcess($program, $course, $doc, $is_approved, [
        'admin_Id' => $admin_Id,
        'ped_Id' => $ped_Id,
        'comu_Id' => $com_Id,
        'professor_Id' => $professor_id,
    ]);

    $feco_id = $data['feco_id'] ?? null;
    $pedApproved = $data['aprobadoPedagogico'] ?? null;
    $comApproved = $data['aprobadoComunicativo'] ?? null;

    $documentRepository->updateFecuApprovalStatus([
        'id_program' => $program,
        'id_course' => $course,
        'ped_approval' => ($pedApproved === "1") ? '1' : '0',
        'comu_approval' => ($comApproved === "1") ? '1' : '0',
    ]);

    $existingUnits = $documentRepository->getUnidadesByFecoId($feco_id);
    $submittedUnidadIds = array_map(fn($unit) => $unit['unit'], $units);

    foreach ($existingUnits as $existingUnit) {
        if (!in_array($existingUnit['id_unit'], $submittedUnidadIds)) {
            $documentRepository->deleteUnidadDimension($existingUnit['fudi_id']);
        }
    }

    foreach ($units as $unit) {
        $existingFedp = $documentRepository->getPedagogicalData($unit['unit'], $program, $course);
        $existingFedc = $documentRepository->getCommunicativeData($unit['unit'], $program, $course);

        $fedp_id = null;
        $fedc_id = null;

        if (!empty($unit['pedagogical'])) {
            if ($existingFedp) {
                $documentRepository->updatePedagogicalData([
                    'id' => $existingFedp['fedp_id'],
                    'reviewDate' => $unit['pedagogical']['reviewDate'] ?? null,
                    'approved' => !empty($unit['pedagogical']['approved']) ? '1' : '0',
                    'reviewNumber' => $unit['pedagogical']['reviewNumber'] ?? '',
                    'observation' => $unit['pedagogical']['observation'] ?? '',
                    'files' => $unit['pedagogical']['files'] ?? null,
                ]);
            } else {
                $fedp_id = $documentRepository->insertIntoDimenPedagogical([
                    'reviewDate' => $unit['pedagogical']['reviewDate'] ?? null,
                    'approved' => !empty($unit['pedagogical']['approved']) ? '1' : '0',
                    'reviewNumber' => $unit['pedagogical']['reviewNumber'] ?? '',
                    'observation' => $unit['pedagogical']['observation'] ?? '',
                    'files' => $unit['pedagogical']['files'] ?? null,
                ]);
            }
        }

        if (!empty($unit['comunicational'])) {
            if ($existingFedc) {
                $documentRepository->updateCommunicativeData([
                    'id' => $existingFedc['fedc_id'],
                    'reviewDate' => $unit['comunicational']['reviewDate'] ?? null,
                    'approved' => !empty($unit['comunicational']['approved']) ? '1' : '0',
                    'observation' => $unit['comunicational']['observation'] ?? '',
                    'reviewNumber' => $unit['comunicational']['reviewNumber'] ?? '',
                    'files' => $unit['comunicational']['files'] ?? null,
                ]);
            } else {
                $fedc_id = $documentRepository->insertIntoDimenComu([
                    'reviewDate' => $unit['comunicational']['reviewDate'] ?? null,
                    'approved' => !empty($unit['comunicational']['approved']) ? '1' : '0',
                    'observation' => $unit['comunicational']['observation'] ?? '',
                    'reviewNumber' => $unit['comunicational']['reviewNumber'] ?? '',
                    'files' => $unit['comunicational']['files'] ?? null,
                ]);
            }
        }

        $documentRepository->insertOrUpdateUnitDimension([
            'fedp_id' => $fedp_id ?? ($existingFedp['fedp_id'] ?? null),
            'fedc_id' => $fedc_id ?? ($existingFedc['fedc_id'] ?? null),
            'id_unit' => $unit['unit'],
            'id_course' => $course,
            'id_program' => $program,
            'id_form_1' => $feco_id,
        ]);
    }

    $connection->commit();
    return new JsonResponse(['status' => 'Success', 'message' => 'Successful update.'], 200);
}



    #[Route(path: "/allf4formats", name: "allf4formats", methods: ["GET"])]
    public function allF4Formats(Request $request, FirstDocRepository $documentRepository, Connection $connection)
    {


        $fromYear = $request->query->get('fromYear');
        $toYear = $request->query->get('toYear', date('Y'));


        if ($fromYear == "0" || empty($fromYear)) {
            $fromYear = "2000";
        }


        if ($toYear == '0' || empty($toYear)) {
            $toYear = date('Y');
        }


        $data = $documentRepository->selectAllFormats($fromYear, $toYear);


        return new JsonResponse($data, 200);
    }



    #[Route(path: "/updateDocument", name: "updateDocument", methods: ["GET"])]
    public function f4UpdateQuery(Request $request, FirstDocRepository $documentRepository, Connection $connection): JsonResponse
    {


        // Retrieve parameters from the request
        $program_id = $request->query->get('program_id');
        $course_id = $request->query->get('course_id');
        $feco_id = $request->query->get('feco_id');
        
        // Validate the parameters
        if (empty($program_id) || empty($course_id) || empty($feco_id)) {
            return new JsonResponse(['status' => 'Error', 'message' => 'Empty fields are not allowed.'], 400);
        }

        // Fetch data using your repository method
        $data = $documentRepository->getDocData($program_id, $course_id, $feco_id);

        // Return the response
        return new JsonResponse($data, 200);
    }




    #[Route(path: "/generatepdf", name: "f4generatepdf", methods: ["POST"])]
    public function f4GeneratePdf(Request $request, FirstDocRepository $documentRepository, Connection $connection, Environment $twig): Response
    {

        $data = json_decode($request->getContent(), true);
        
        $course_id = $data["course_id"];
        $idFeco = $data["feco_id"];
        $program_id = $data["program_id"];
        $show = $documentRepository->getPDFFromUpdateData($program_id, $course_id, $idFeco);
        
        $transformedData = $documentRepository->transformPDFData($show);
        
        // Generate the HTML using the Twig template
        $html = $twig->render('PDF/form1.html.twig', [
            'program' => $program_id,
            'course' => $course_id,
            'submit_date' => $data['fecha_entrega'],
            'show' => $transformedData,
        ]);

        // Generate the PDF
        $pdf = new TCPDF();
        $pdf->SetCreator(PDF_CREATOR);
        $pdf->SetAuthor('Andres');
        $pdf->SetTitle('Document');
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        $pdf->SetMargins(15, 15, 15);
        $pdf->AddPage('P', 'A4');
        $pdf->writeHTML($html);

        // Output the PDF as a string
        $pdfOutput = $pdf->Output('formato-evaluacion-' . date('Y-m-d_H-i-s') . '.pdf', 'S');


        // Return the PDF response
        return new Response($pdfOutput, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="formato-evaluacion-' . date('Y-m-d_H-i-s') . '.pdf"'
        ]);
    }





    #[Route(path: "/getApprovedExpertos", name: "approvedexpertosgeneratepdf", methods: ["GET"])]
    public function getapprovedExperto(Request $request, FirstDocRepository $documentRepository, Connection $connection): JsonResponse
    {

        $idFeco = $request->query->get('feco_id');

        $isApproved = $documentRepository->isFullyApproved($idFeco);



        return new JsonResponse(['isApproved' => $isApproved]);
    }
}