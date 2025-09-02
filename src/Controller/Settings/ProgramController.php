<?php

namespace App\Controller\Settings;

use App\Repository\BasicConfiguration\ProgramRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface;

#[Route(path: "/document/configuration/program", name: "document_basic_configuration_program")]
class ProgramController extends AbstractController
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


    #[Route(path: "/insert", name: "insertprogram", methods: ["POST"])]
    public function InsertProgram(Request $request, ProgramRepository $programaRepository): Response
    {
        // Decode the JSON request content
        $data = json_decode($request->getContent(), true);

        $name = $data['name'] ?? null;
        $type = $data['type'] ?? null; // Get the type value
        $id = $data['id_program'] ?? null; // Get the id_program value
        $idFaculty = $data['id_faculty'] ?? null;
        
        // Validate the input
        if (!$name) {
            return new Response('Program name required.', Response::HTTP_BAD_REQUEST);
        }
        if ($programaRepository->checkIfProgramaExists($name, $id)) {
            return new Response("There's a program with that name", Response::HTTP_BAD_REQUEST);
        }
        try {
            if ($type === 'U' && $id !== null) {
                // Logic for updating the program
                $programaRepository->updateProgram($name, $id, $idFaculty);
                return $this->json(['status' => 'success', 'message' => 'Program updated successfully.'], Response::HTTP_OK);
            } else if ($type === 'I') {
                // Call the repository method to insert the program
                $programaRepository->insertProgram($name, $idFaculty);
                return $this->json(['status' => 'success', 'message' => 'Program inserted successfully.'], Response::HTTP_CREATED);
            } else {
                return new Response('Type not valid.', Response::HTTP_BAD_REQUEST);
            }
        } catch (\Exception $e) {
            return new Response('Error: ' . $e->getMessage(), Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route(path: "/tableprograms", name: "tableprograms", methods: ["GET"])]
    public function tableprograms(Request $request, ProgramRepository $programRepository): Response
    {
        // Fetch all programs from the repository
        $fromYear = $request->query->get('fromYear');
        $toYear = $request->query->get('toYear', date('Y'));


        if ($fromYear == "0" || empty($fromYear)) {

            $fromYear = "2000";
        }


        if ($toYear == '0' || empty($toYear)) {
            $toYear = date('Y');
        }

        $programs = $programRepository->fetchAllProgramsTable($fromYear, $toYear);
        

        // Return the programas as a JSON response
        return $this->json($programs);
    }


    #[Route(path: "/allprograms", name: "allprograms", methods: ["GET"])]
    public function allprograms(Request $request, ProgramRepository $programaRepository): Response
    {
        // Fetch all programas from the repository
        $fromYear = $request->query->get('fromYear');
        $toYear = $request->query->get('toYear', date('Y'));


        if ($fromYear == "0" || empty($fromYear)) {

            $fromYear = "2000";
        }


        if ($toYear == '0' || empty($toYear)) {
            $toYear = date('Y');
        }

        $programas = $programaRepository->fetchAllProgramas($fromYear, $toYear);

        // Return the programas as a JSON response
        return $this->json($programas);
    }

    #[Route(path: "/programbyid/{id}", name: "programbyid", methods: ["GET"])]
    public function programById(int $id, ProgramRepository $programRepository): Response
    {
        $program = $programRepository->fetchProgramaById($id);
       
        return $this->json($program);
    }

    #[Route(path: "/delete/{id}", name: "deleteprogram", methods: ["DELETE"])]
    public function deleteProgram(int $id, ProgramRepository $programRepository): Response
    {
        try {
            // Call the repository method to delete the program
            $programRepository->deleteProgram($id);
            return new Response('Programa eliminado con éxito!', Response::HTTP_OK);
        } catch (\Exception $e) {
            return new Response('Error: ' . $e->getMessage(), Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }



    #[Route(path: "/allfaculties", name: "allfaculties", methods: ["GET"])]
    public function allfaculties(ProgramRepository $programRepository): Response
    {
        // Fetch all programs from the repository
        $faculties = $programRepository->fetchAllFacultades();


        // Return the programs as a JSON response
        return $this->json($faculties);
    }


}