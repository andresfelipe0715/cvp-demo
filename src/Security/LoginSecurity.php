<?php

namespace App\Security;


use App\Repository\UserRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;
use Symfony\Component\Security\Http\Authenticator\Passport\Credentials\CustomCredentials;
use Symfony\Component\Security\Csrf\CsrfToken;
use Symfony\Component\Ldap\Ldap;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\User;


class LoginSecurity extends AbstractAuthenticator
{
    /**
     * Called on every request to decide if this authenticator should be
     * used for the request. Returning `false` will cause this authenticator
     * to be skipped.
     */

    private $validate;
    private $em;
    private $csrfTokenManager;
    

    public function __construct(Ldap $ldap, ValidatorInterface $validator, EntityManagerInterface $em, CsrfTokenManagerInterface $csrfTokenManager)
    {
        
        
        $this->ldap = $ldap;
        $this->validate = $validator;
        $this->em = $em;
        $this->csrfTokenManager = $csrfTokenManager;
        
        
    }


    public function supports(Request $request): ?bool
    {
 
       
        
        return 'logindata' === $request->attributes->get('_route') && $request->isMethod('POST');
        
    }

    public function authenticate(Request $request): Passport
    {
        $csrfTokenHeader = $request->headers->get('csrf-token');
        $token = new CsrfToken('get-item', $csrfTokenHeader);
        
        if (!$this->csrfTokenManager->isTokenValid($token)) {
            throw new CustomUserMessageAuthenticationException('Invalid User', [], 403);
        }
        
        
    
        
        $data = json_decode($request->getContent(), true);
        $id = $data['id'] ?? null;
    
        
        
        
        /** @var UserRepository $repository */
        $repository = $this->em->getRepository(User::class);
        
        
        
        
        $entity = $repository->findOneById($id);
    
       
        
        if ($entity === null) {
            dump('User not found');
            throw new CustomUserMessageAuthenticationException('User not found', [], 404);
        }
        
        if ($entity->getStatus() === 'na') {
            throw new CustomUserMessageAuthenticationException('Inactive User', [], 403);
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
    }
    



    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
       
        return null;
    }
    

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {

        $statusCode = $exception->getCode() ?: Response::HTTP_UNAUTHORIZED;
        $data = [
            'message' => $exception->getMessage(),
            'success' => false
        ];

        return new JsonResponse($data, $statusCode);
    }
}