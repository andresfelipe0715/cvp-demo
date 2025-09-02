// RenderCardDimensions.js
import React from 'react';
import { CardDimension } from './CardDimension'; // Adjust the import path if necessary

const RenderCardDimensions = ({ roles, boxUnit, index, setFormData }) => {
    if (roles.includes("admin") || roles.includes("organizacional")) {
        return (
            <>
                <CardDimension
                    title={`Pedagogical Dimension`}
                    dimension={boxUnit.pedagogical}
                    setDimension={setFormData}
                    id={index}
                    type="pedagogical"
                />
                <CardDimension
                    title={`Comunicational Dimension`}
                    dimension={boxUnit.comunicational}
                    setDimension={setFormData}
                    id={index}
                    type="comunicational"
                />
            </>
        );
    }

    if (roles.includes("pedagogical")) {
        return (
            <CardDimension
                title={`Dimensión pedagógica`}
                dimension={boxUnit.pedagogical}
                setDimension={setFormData}
                id={index}
                type="pedagogical"
            />
        );
    }

    if (roles.includes("comunicational")) {
        return (
            <CardDimension
                title={`Dimensión comunicativa`}
                dimension={boxUnit.comunicational}
                setDimension={setFormData}
                id={index}
                type="comunicational"
            />
        );
    }

    return null; // Return null if no roles match
};

export default RenderCardDimensions;
