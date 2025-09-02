<?php
namespace App\Repository\Role;

use Doctrine\ORM\EntityManagerInterface;

class RoleRepository
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    public function findRoleNamesByIds(array $roleIds): array
    {
        $conn = $this->entityManager->getConnection();

        // Filter: keep only valid 2-char strings (adjust if needed)
        $roleIds = array_filter($roleIds, fn($id) => is_string($id) && strlen($id) === 2);

        if (empty($roleIds)) {
            return [];
        }

        // Quote each ID safely
        $quotedIds = implode(',', array_map(fn($id) => $conn->quote($id), $roleIds));

        $sql = "SELECT name FROM roles WHERE id IN ($quotedIds)";
        $result = $conn->executeQuery($sql)->fetchAllAssociative();

        return $result;
    }
}