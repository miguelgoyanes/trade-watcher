


import React, { useState } from 'react';
import styles from './Dropdown.module.css';

const Dropdown = ({ range, setRange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleOptionClick = (option) => {
        setRange(option);  // Actualiza el estado en el componente padre
        setIsOpen(false);
    };

    return (
        <div className={styles.dropdown}>
            <div className={styles.dropdownHeader} onClick={toggleDropdown}>
                {range}
            </div>
            {isOpen && (
                <ul className={styles.dropdownList}>
                    <li onClick={() => handleOptionClick('1m')}>1m</li>
                    <li onClick={() => handleOptionClick('5m')}>5m</li>
                </ul>
            )}
        </div>
    );
};

export default Dropdown;