<?php

namespace App\Controller\Dashboard;


use App\Repository\BasicConfiguration\Users\UserRepository;
use App\Repository\Role\RoleRepository;
use App\Repository\Users\UsersRepository;
use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;

class dashboardController extends AbstractController
{
    #[Route(path: "/dashboardrequest", name: "dashboardrequest", methods: ["GET"])]
    public function dashboardRequest(
        Request $request,
        JWTEncoderInterface $jwtEncoder,
        RoleRepository $roleRepository
    ): JsonResponse {

       
        $token = $request->cookies->get('CVP');
        if (!$token) {
            return new JsonResponse(['error' => 'Token not found'], Response::HTTP_UNAUTHORIZED);
        }

        try {

            $data = $jwtEncoder->decode($token);


            $roles = $data['data']['roles'];
            if (!empty($roles) && is_string($roles[0])) {
                $decodedRoles = json_decode($roles[0], true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decodedRoles)) {
                    $roles = array_merge($decodedRoles, array_slice($roles, 1));
                } else {
                    return new JsonResponse(['error' => 'Failed to decode roles'], Response::HTTP_INTERNAL_SERVER_ERROR);
                }
            }


            $roleNames = $roleRepository->findRoleNamesByIds($roles);
            
            $roleNames = array_column($roleNames, 'name');
            
            $id = $data['data']['id'] ?? 'Unknown';
            

            $response = [
                "message" => "SUCCESSFUL",
                "data" => $data,
                "id" => $id,
                "role_names" => $roleNames,

            ];

            return new JsonResponse($response, Response::HTTP_OK);
        } catch (\Exception $e) {
            error_log($e->getMessage());
            return new JsonResponse(['error' => 'An error occurred'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route(path: "/getUserName/{id}", name: "get_user_name", methods: ["GET"])]
    public function getUserName(string $id,UserRepository $usersRepository): JsonResponse {
        
        try {
            // Query the user by id
            $user = $usersRepository->findNameAndTitleByID(['id' => $id]);
            
            
            if (!$user) {
                return new JsonResponse(['error' => 'User not found'], Response::HTTP_NOT_FOUND);
            }
            
            // Respond with the user's name
            return new JsonResponse([
                'message' => 'User found',
                'name' => $user['name'],
                'title_name' => $user['title_name']
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            error_log($e->getMessage());
            return new JsonResponse(['error' => 'An error occurred'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
