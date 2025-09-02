export const getRoleMessage = (roles) => {
    // Mapeo para traducir los roles
    const roleTranslations = {
        pedagogico: 'Pedagogical ',
        comunicativo: 'Comunicational',
        experto: 'Subject Matter Expert',
        admin: 'Admin',
        organizacional: 'Organizacional'
    };

    if (roles.includes('pedagogico') || roles.includes('comunicativo')) {
        // Traducir solo los roles relevantes
        const translatedRoles = roles.map(role => roleTranslations[role] || role);
        return `${translatedRoles.join(' y ')} coordinator  `;
    }

    if (roles.includes('experto')) {
        // Capitalizar "experto" y traducir
        const translatedRoles = roles.map(role => roleTranslations[role] || role);
        return translatedRoles.join(' y ');
    }

    if (roles.includes('admin')) {
        return `${roleTranslations['admin']}`;
    }

    if (roles.includes('organizacional')) {
        const translatedRoles = roles.map(role => roleTranslations[role] || role);
        return `${translatedRoles.join(' y ')} coordinator  `;
    }

    return '';
};
