<?php

namespace App\Controller\Settings;



use App\Repository\BasicConfiguration\UnitRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface;

#[Route(path: "/document/configuration/unit", name: "formato_basic_configuration_unit")]
class UnitController extends AbstractController
{


    private JWTEncoderInterface $JWTEncoder;

    public function __construct(JWTEncoderInterface $JWTEncoder)
    {
        $this->JWTEncoder = $JWTEncoder;

    }

    private function getRolesFromToken(Request $request): array
    {
        $token = $request->cookies->get('CVP');
        if (!$token) {
            throw new AccessDeniedHttpException('No token found');
        }

        try {
            $decodedToken = $this->JWTEncoder->decode($token);
            $roles = $decodedToken['data']['roles'] ?? [];

            // Parse and clean roles (ignore "ROLE_USER")
            $parsedRoles = [];
            foreach ($roles as $role) {
                $cleanedRole = json_decode($role, true);
                if (is_array($cleanedRole)) {
                    $parsedRoles = array_merge($parsedRoles, $cleanedRole);
                } elseif ($role !== 'ROLE_USER') {
                    $parsedRoles[] = $role;
                }
            }

            return $parsedRoles;
        } catch (\Exception $e) {
            throw new AccessDeniedHttpException('Invalid or expired token');
        }
    }

    private function checkRoles(array $userRoles, array $requiredRoles): void
    {

        if (empty(array_intersect($userRoles, $requiredRoles))) {
            throw new AccessDeniedHttpException('You do not have permission to access this page');
        }
    }



    #[Route(path: "/insert", name: "insertunidades", methods: ["POST"])]
    public function insertUnidades(Request $request, UnitRepository $unitRepository): JsonResponse
    {
        // Get the JSON content from the request
        $data = json_decode($request->getContent(), true);


        // Access individual fields from the data
        $program = $data['program'] ?? null;
        $course = $data['course'] ?? null;
        $units = $data['units'] ?? [];
        $type = $data['type'] ?? null; // Get the type

        if ($program === null || $course === null || empty($units) || $type === null) {
            return $this->json(['error' => 'Invalid data provided.'], Response::HTTP_BAD_REQUEST);
        }

        try {
            if ($type === 'I') {
                $course_id = $course['id_course'] ?? null;
                $program_id = $program['id'] ?? null;

                if ($course_id === null || $program_id === null) {
                    return $this->json(['error' => 'Course ID or Program ID not found.'], 400);
                }

                foreach ($units as $unit) {
                    $name = $unit['name'] ?? null;
                    $unit_id = $unit['unit_id'] ?? null;

                    // Check for duplicate units
                    $exists = $unitRepository->checkUnitExists($name, $program_id, $course_id, $type === 'U' ? $unit_id : null);
                    if ($exists) {
                        return $this->json(['status' => 'error', 'message' => "Warning, The Unit'{$name}' already exists for this module"], 400);
                    }
                }
                // Call the repository method to insert units
                $unitRepository->insertUnits($units, $program['id'], $course['id_course']);
                return $this->json(['status' => 'success', 'message' => 'Unidades inserted successfully.'], Response::HTTP_CREATED);
            } elseif ($type === 'U') {
                $course_id = $course['id_modulo'] ?? null;
                $program_id = $program['id_programa'] ?? null;

                if ($course_id === null || $program_id === null) {
                    return $this->json(['error' => 'No se encuentra id del módulo o id del program.'], 400);
                }


                foreach ($units as $unit) {
                    $name = $unit['name'] ?? null;
                    $unit_id = $unit['unit_id'] ?? null;
                    $name = trim($name);
                    // Check for duplicate units
                    $exists = $unitRepository->checkUnitExists($name, $program_id, $course_id, $type === 'U' ? $unit_id : null);
                    if ($exists) {
                        return $this->json(['status' => 'error', 'message' => "Warning, The unit '{$name}' already exists for that course."], 400);
                    }
                }
                // Call the repository method to update units
                $unitRepository->updateUnits($units); // Make sure to implement this method in the repository
                return $this->json(['status' => 'success', 'message' => 'Units updated successfully.'], Response::HTTP_OK);
            } else {
                return $this->json(['error' => 'Invalid type provided.'], Response::HTTP_BAD_REQUEST);
            }
        } catch (\RuntimeException $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }




    #[Route(path: "/allunits", name: "allunits", methods: ["GET"])]
    public function allUnits(Request $request, UnitRepository $unitRepository): Response
    {
        $fromYear = $request->query->get('fromYear');
        $toYear = $request->query->get('toYear', date('Y'));


        if ($fromYear == "0" || empty($fromYear)) {

            $fromYear = "2000";
        }


        if ($toYear == '0' || empty($toYear)) {
            $toYear = date('Y');
        }
        // Fetch all programas from the repository
        $units = $unitRepository->fetchAllUnits($fromYear, $toYear);

        // Return the programas as a JSON response
        return $this->json($units);
    }

    #[Route(path: "/getunidadbyids", name: "getunidadbyids", methods: ["GET"])]
    public function getUnidadByIds(Request $request, UnitRepository $unitRepository): Response
    {
        // Get the IDs from the query parameters
        $id_programa = $request->query->get('id_programa');
        $id_modulo = $request->query->get('id_modulo');
        $id_unidad = $request->query->get('id_unidad');

        // Call the repository method and pass the IDs
        $unit = $unitRepository->fetchUnidadByIds($id_programa, $id_modulo, $id_unidad);

        // Return the unidad data as a JSON response
        return $this->json($unit);
    }


    #[Route(path: "/delete/{id}", name: "deleteunidad", methods: ["DELETE"])]
    public function deleteUnidad(int $id, UnitRepository $unitRepository): JsonResponse
    {
        try {
            $unitRepository->deleteUnit($id);
            return $this->json(['status' => 'success', 'message' => 'Unidad eliminada con éxito.']);
        } catch (\RuntimeException $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }




    #[Route(path: "/selectunitsbycourse/{course_id}", name: "selectunitscourses", methods: ["GET"])]
    public function selectUnidadesModulo(int $course_id, UnitRepository $unitRepository): Response
    {


        // Fetch the modules for the selected program (id_programa)
        $units = $unitRepository->fetchUnitsByCourse($course_id);


        return $this->json($units);
    }






}