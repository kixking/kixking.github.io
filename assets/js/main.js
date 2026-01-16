/**
 * Simple Tools - Main Portal Logic
 * Handles filtering of tool cards
 */

document.addEventListener('DOMContentLoaded', () => {
    const filterChips = document.querySelectorAll('.filter-chip');
    const toolCards = document.querySelectorAll('.tool-card');

    if (filterChips.length > 0) {
        filterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                // Remove active class from all chips
                filterChips.forEach(c => c.classList.remove('active'));
                // Add active class to clicked chip
                chip.classList.add('active');

                const filterValue = chip.getAttribute('data-filter');

                toolCards.forEach(card => {
                    if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                        card.classList.remove('hidden');
                    } else {
                        card.classList.add('hidden');
                    }
                });
            });
        });
    }
});
