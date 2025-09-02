<?php

namespace App\Controller;

use App\Entity\User;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface;
class loginController extends AbstractController
{
    private $em;
    

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    #[Route(path: "/logindata", name: "logindata", methods: ["POST"])]
    public function login(Request $request, JWTEncoderInterface $jwttoken): Response
    {
        $data = json_decode($request->getContent(), true);
    
        $id = $data['id'] ?? null;
        $password = $data['password'] ?? null;
    
        $repository = $this->em->getRepository(User::class);
        $entity = $repository->findUser($id, $password);
        
        if ($entity) {
            // Create the token data
            $tokenData = [
                "data" => [
                    "id" => $entity->getId(),
                    "roles" => $entity->getRoles()
                ]
            ];
            


            // Generate the JWT token
            $token = $jwttoken->encode($tokenData);
            
           
            
            // Create a secure, HTTP-only cookie with the token
            $cookie = Cookie::create('CVP')
                ->withValue($token)
                ->withExpires(time() + (1 * 365 * 24 * 60 * 60))
                ->withDomain('127.0.0.1')
                ->withSecure(true)
                ->WithHttpOnly(true);
    

            $response = new JsonResponse(['token' => $token], Response::HTTP_OK);
            $response->headers->setCookie($cookie);
    
            return $response;
        }
    
        // Return error response if no user is found
        return new JsonResponse(['error' => 'error, invalid credentials'], Response::HTTP_NOT_FOUND);
    }
    

}
