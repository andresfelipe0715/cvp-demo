<?php

namespace App\Controller\Documents;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\Routing\Annotation\Route;
use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface;

#[Route(path: "dashboard/document", name: "formato")]
class ViewsDocController extends AbstractController
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

    private function checkRoles(array $userRoles, array $requiredRoles): ?RedirectResponse
    {
        // Check if the user has the required role
        if (empty(array_intersect($userRoles, $requiredRoles))) {
            // Reset the 'CVP' cookie
            $cookie2 = new Cookie('CVP', '', time() - 3600, '/', '127.0.0.1', true, true);
            $response = new RedirectResponse('/login'); // Redirect to login if roles don't match
            $response->headers->setCookie($cookie2); // Add cookie reset to the response

            // Return the response, so that the controller can handle the redirect
            return $response;
        }

        // No redirect, so return null
        return null;
    }

    #[Route(path: "/{type}", name: "documents_type", methods: ["GET"])]
    public function documents(Request $request, string $type): Response
    {   

        $roleMap = [
            'document1' => ['01', '02', '03', '04'],
            'document2' => ['01'],
        ];

        if (!array_key_exists($type, $roleMap)) {
            throw $this->createNotFoundException('Invalid type');
        }
        $roles = $this->getRolesFromToken($request);
        $this->checkRoles($roles, $roleMap[$type]);

        return $this->render('base.html.twig');
        
    }

}