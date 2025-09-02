<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\RedirectResponse; // Make sure this import exists
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ViewsController extends AbstractController
{
    #[Route(path: "/app", name: "app", methods: ["GET"])]
    public function App()
    {
        return $this->render('app.html.twig');
    }

    #[Route('/', name: 'homepage')]
    public function index(): RedirectResponse
    {
        return $this->redirectToRoute('login');
    }

    #[Route(path: "/login", name: "login", methods: ["GET"])]
    public function Login(Request $request): Response
    {
        $cookieDelete = new Cookie('CVP', '', time(), '/', '127.0.0.1', true, true);

        $response = $this->render('base.html.twig');
    
        $response->headers->setCookie($cookieDelete);

        return $response;
    }

    #[Route(path: "/dashboard", name: "dashboard", methods: ["GET"])]
    public function Dashboard()
    {
        return $this->render('base.html.twig');
    }

}
