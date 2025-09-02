<?php

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\DBAL\Connection;
use Symfony\Component\Ldap\Ldap;

/**
 * @extends ServiceEntityRepository<User>
 *
 * @method User|null find($id, $lockMode = null, $lockVersion = null)
 * @method User|null findOneBy(array $criteria, array $orderBy = null)
 * @method User[]    findAll()
 * @method User[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class UserRepository extends ServiceEntityRepository
{
    private $connection;
    private $bind_dn;
    private $dn;
    private $pass;
    private $ldap;




    public function __construct(ManagerRegistry $registry, Connection $connection, Ldap $ldap)
    {
        parent::__construct($registry, User::class);
        $this->connection = $connection;
        $this->ldap = $ldap;


    }



    public function LDAPBIND(User $user)
    {

      
        return "";
    }


    public function findUsersInAval(): array
    {
        $conn = $this->getEntityManager()->getConnection();
        $sql = "SELECT * FROM users";

        return $conn->executeQuery(sql: $sql)->fetchAssociative();
    }


    public function findOneById($id): ?User
    {
        $conn = $this->getEntityManager()->getConnection();

        $sql = 'SELECT * FROM users WHERE id = :id';

        $resultSet = $conn->executeQuery($sql, ['id' => $id]);
        $result = $resultSet->fetchAssociative();

        if ($result) {
            $user = new User();
            $user->setId($result['id']);
            $user->setPassword($result['password'] ?? '');
            $user->setRoles([$result['id_roles']]);
            $user->setStatus($result['status']);
            return $user;
        }

        return null;
    }


    public function findUser($id, $password): ?User
    {
        $conn = $this->getEntityManager()->getConnection();

        $sql = 'SELECT * FROM users WHERE id = :id';

        $resultSet = $conn->executeQuery($sql, ['id' => $id]);
        $result = $resultSet->fetchAssociative();

        if ($result) {

            $hashedpassword = hash('sha256', $password);
            $user = new User();
            $user->setId($result['id']);
            $user->setPassword($password);
            $user->setRoles([$result['id_roles']]);
            $user->setStatus($result['status']);

            if ($result && $hashedpassword === $result['password']) {
                return $user;
            } 
        }
        return null;
    }



}