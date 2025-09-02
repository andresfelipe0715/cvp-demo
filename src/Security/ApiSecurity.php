<?php

namespace App\Security;

use App\Entity\User;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTEncoderInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\AbstractLoginFormAuthenticator;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Http\Authenticator\Passport\Credentials\CustomCredentials;

class ApiSecurity extends AbstractLoginFormAuthenticator
{

    private $validate;
    private $repository;
    private $JWTEncoder;
    private $router;
    private $request_route;

    public function __construct(RouterInterface $route, ValidatorInterface $validator, EntityManagerInterface $em, JWTEncoderInterface $JWTEncoder)
    {
        $this->router = $route;
        $this->validate = $validator;
        $this->repository = $em->getRepository(user::class);
        $this->JWTEncoder = $JWTEncoder;
    }

    public function supports(Request $request): bool
    {
        $this->request_route = $request->attributes->get('_route');
        return in_array($request->getMethod(), ['GET', 'POST']);
    }


    public function authenticate(Request $request): Passport
{

    try {
        // Get the token from the CVP cookie
        $token = $request->cookies->get("CVP");

        // If token is not found, throw an authentication exception
        if (is_null($token)) {
            throw new CustomUserMessageAuthenticationException('Token not found');
        }

        // Decode the JWT token
        $validacion = $this->JWTEncoder->decode($token);

        // Check if the decoded token contains 'id'
        if (!isset($validacion['data']['id'])) {
            throw new CustomUserMessageAuthenticationException('User Data is not valid');
        }

        // Retrieve the 'id' from the token
        $id = $validacion['data']['id'];
        
        
        $entity = $this->repository->findOneById($id);

        
        
        
        if (!$entity) {
            throw new CustomUserMessageAuthenticationException('User Not found');
        }

        
        return new Passport(
            new UserBadge($entity->getId()),
            new CustomCredentials(

                function (User $user) {
                    
                    return !empty($user->getId());
                },
                $entity,
            )
        );
    } catch (\Exception $e) {
        // Catch and throw any exception during the process
        throw new CustomUserMessageAuthenticationException('Token inválido o error de autenticación');
    }
}



    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        return null;
    }

    /**
     * Override to change what happens after a bad username/password is submitted.
     */
    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): Response
    {
        // Ensure no output has been sent already
        if (headers_sent()) {
            // Handle the case where headers are already sent
            return new Response('Unauthorized', Response::HTTP_UNAUTHORIZED);
        }
    
        // Set a cookie to clear the existing session/token
        $cookie2 = new Cookie('CVP', '-', time(), '/', '127.0.0.1', true, true);
    
        // Create a RedirectResponse to /login
        $response = new RedirectResponse($this->getLoginUrl($request));
    
        // Set the cookie to the response
        $response->headers->setCookie($cookie2);
    
        // Set the status code for unauthorized access
        $response->setStatusCode(Response::HTTP_UNAUTHORIZED);
    
        // Return the response, which will handle setting the headers, redirect, and sending the response
        return $response;
    }

    /**
     * Override to control what happens when the user hits a secure page
     * but isn't logged in yet.
     */
    public function start(Request $request, AuthenticationException $authException = null): Response
    {
        return new RedirectResponse($this->getLoginUrl($request));
    }

    public function isInteractive(): bool
    {
        // onAuthenticationSuccess viene aquí
        return true;
    }

    public function getLoginUrl(Request $request): string
    {
        return '/';
    }

}





