<?php

namespace App\Controller\Settings;

use App\Repository\BasicConfiguration\CourseRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface;

#[Route(path: "/document/configuration/course", name: "document_basic_configuration_course")]
class CourseController extends AbstractController
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


    #[Route(path: "/insert", name: "insertOrUpdateCourse", methods: ["POST"])]
    public function insertOrUpdateModulo(Request $request, CourseRepository $courseRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (isset($data['course']) && is_array($data['course'])) {
            try {
                foreach ($data['course'] as $course) {
                    if (isset($course['type'])) {
                        $id = $course['type'] === 'U' ? ($course['id'] ?? null) : null;
                        $name = trim($course['name']);
                        $exists = $courseRepository->checkNameExists($name, $course['id_program'], $id);

                        if ($exists) {
                            return new JsonResponse(
                                ['status' => 'error', 'message' => "Warning: The name '{$name}' already exists for a program."],
                                400
                            );
                        }
                        if ($course['type'] === 'I') {
                            // Insert operation
                            $courseRepository->insertCourse($course['name'], $course['id_program'], $course['expert_id'], $course['semester'], $course['credit_number']);
                            $statusCode = Response::HTTP_CREATED;
                        } elseif ($course['type'] === 'U' && isset($course['id'])) {
                            $courseRepository->updateCourse($course['name'], $course['id'], $course['expert_id'], $course['semester'], $course['credit_number']);
                            $statusCode = Response::HTTP_OK;
                        } else {
                            return new JsonResponse(['status' => 'error', 'message' => 'Invalid type or missing id for update.'], Response::HTTP_BAD_REQUEST);
                        }
                    }
                }

                return new JsonResponse(['status' => 'success', 'message' => 'Operation completed successfully.'], $statusCode);
            } catch (\Exception $e) {
                return new JsonResponse(['status' => 'error', 'message' => 'Error processing request: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        }

        return new JsonResponse(['status' => 'error', 'message' => 'Invalid data provided.'], Response::HTTP_BAD_REQUEST);
    }


    #[Route(path: "/allcourses", name: "allcourses", methods: ["GET"])]
    public function allcourses(Request $request, CourseRepository $moduloRepository): Response
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
        $courses = $moduloRepository->fetchAllCourses($fromYear, $toYear);

        // Return the programas as a JSON response
        return $this->json($courses);
    }
    #[Route(path: "/coursebyids", name: "coursebyids", methods: ["GET"])]
    public function courseByIds(Request $request, CourseRepository $courseRepository): Response
    {

        $id_program = $request->query->get('id_program');
        $id_course = $request->query->get('id_course');


        // Fetch all programas from the repository
        $course = $courseRepository->fetchCourseByIds($id_program, $id_course);
        // Return the programas as a JSON response
        return $this->json($course);
    }


    #[Route(path: "/selectcoursesbyprogram/{id}", name: "selectcoursesbyprogram", methods: ["GET"])]
    public function selectCoursesByProgram(int $id, CourseRepository $courseRepository): Response
    {

        
        // Fetch the courses for the selected program (id)
        $courses = $courseRepository->fetchCoursesByProgram($id);

        
        return $this->json($courses);
    }



    #[Route(path: "/delete/{id}", name: "deleteprograma", methods: ["DELETE"])]
    public function deleteCourse(int $id, CourseRepository $courseRepository): Response
    {


        try {
            // Call the repository method to delete the program
            $courseRepository->deleteCourse($id);
            return new Response('Course deleted successfully!', Response::HTTP_OK);
        } catch (\Exception $e) {
            return new Response('Error: ' . $e->getMessage(), Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }



}