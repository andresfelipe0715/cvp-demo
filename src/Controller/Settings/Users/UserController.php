<?php

namespace App\Controller\Settings\Users;


use App\Repository\BasicConfiguration\Users\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface;

#[Route(path: "/document/configuration/user", name: "formato_basic_configuration_modulo")]
class UserController extends AbstractController
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

    #[Route(path: "/allexperts", name: "alluserexperts", methods: ["GET"])]

    public function getAvalAll(UserRepository $usersRepository): JsonResponse
    {
        // Fetch the data from repository

        $role = "05";  // this is the code for the expert role
        $userData = $usersRepository->findExpertUsers($role);


        return new JsonResponse($userData);
    }



    #[Route(path: "/insertnewuser", name: "insertnewuser", methods: ["POST"])]
    public function NewUser(Request $request, UserRepository $usersRepository): JsonResponse
    {
        // Decode the JSON data from the request
        $data = json_decode($request->getContent(), true);


        // Prepare the data for insertion or updating
        $id = $data['id'] ?? null; 
        $password = $data['password'] ?? null;
        $id_roles = $data['roles'] ?? null;
        $name = $data['name'] ?? null;
        $email = $data['email'] ?? null;
        $status = $data['status'] ?? null;
        $id_title = !empty($data['title']) ? $data['title'] : null;

        // Validate required fields and handle errors if necessary
        if (!$id || !$id_roles || !$status) {
            return new JsonResponse(['error' => 'Missing required fields'], 400);
        }

        if ($data['type'] === 'I') {
            // Insert a new user
            $name = trim($name);
            $usersRepository->insertNewUser($id, $password, $id_roles, $name, email: $email, status: $status, id_title: $id_title);
            return new JsonResponse(['message' => 'User created successfully'], 201);

        } else if ($data['type'] === 'U') {
            
            $name = trim($name);

            $updated = $usersRepository->updateUser($id, $password, $id_roles, $name, email: $email, status: $status, id_title: $id_title);

            if ($updated) {
                return new JsonResponse(['message' => 'User updated successfully'], 200);
            } else {
                return new JsonResponse(['error' => 'User not found or update failed'], 404);
            }
        }

        // Return a bad request response if type is not recognized
        return new JsonResponse(['error' => 'Invalid operation type'], 400);
    }
    #[Route(path: "/allroles", name: "allavalroles", methods: ["GET"])]
    public function allRoles(UserRepository $usersRepository): JsonResponse
    {
        // Fetch all roles from the repository
        $roles = $usersRepository->findAllRoles();

        return new JsonResponse($roles);
    }


    #[Route(path: "/alltitulos", name: "allavaltitulos", methods: ["GET"])]
    public function allTitulos(UserRepository $usersRepository): JsonResponse
    {
        // Fetch all roles from the repository
        $titles = $usersRepository->findAllTitles();

        return new JsonResponse($titles);
    }



    #[Route(path: "/allusers", name: "allusers", methods: ["GET"])]
    public function allUsers(UserRepository $usersRepository): JsonResponse
    {
        // Fetch all roles from the repository
        $users = $usersRepository->findAllUsers();


        return new JsonResponse($users);
    }

    #[Route(path: "/getuserbyid", name: "getuserbyid", methods: ["GET"])]
    public function UserByID(Request $request, UserRepository $usersRepository): JsonResponse
    {


        $id = $request->query->get('documento');
        // Fetch all roles from the repository
        $user = $usersRepository->fetchUserByID($id);

        if (!$user) {
            return new JsonResponse(['error' => 'User not found'], 404);
        }

        return new JsonResponse($user);
    }

}