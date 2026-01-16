/**
 * SQL Formatter Logic Module (Lightweight / Regex based)
 */
export const SqlFormatterLogic = {
    keywords: [
        'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY',
        'HAVING', 'LIMIT', 'OFFSET', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET',
        'DELETE FROM', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN',
        'ON', 'UNION', 'ALL'
    ],

    /**
     * Format SQL string
     * @param {string} sql 
     * @param {string} indentStr Default 2 spaces
     * @returns {string} Formatted SQL
     */
    format(sql, indentStr = '  ') {
        if (!sql) return '';

        // Normalize whitespace: remove newlines, multiple spaces
        let formatted = sql.replace(/\s+/g, ' ').trim();

        // Escape helper for strings (simplified, assumes standard quotes)
        // Note: A full parser is needed for perfect string handling, strictly strictly regex has limits.

        // 1. Insert newlines before keywords
        this.keywords.forEach(kw => {
            const regex = new RegExp(`\\b${kw}\\b`, 'gi');
            formatted = formatted.replace(regex, (match) => `\n${match.toUpperCase()}`);
        });

        // 2. Handle commas
        formatted = formatted.replace(/,/g, ',\n');

        // 3. Handle Parentheses (basic indentation)
        // This is tricky with pure regex. We'll do a simple pass for newlines.
        formatted = formatted.replace(/\(/g, '(\n').replace(/\)/g, '\n)');

        // 4. Manual Indentation Loop
        const lines = formatted.split('\n');
        let depth = 0;
        const resultLines = [];

        lines.forEach(line => {
            line = line.trim();
            if (!line) return;

            // Check for closing parenthesis to reduce depth before adding
            if (line.startsWith(')')) {
                depth = Math.max(0, depth - 1);
            }

            // Create indent string
            const currentIndent = indentStr.repeat(depth);
            resultLines.push(currentIndent + line);

            // Check for opening parenthesis to increase depth after adding
            // (Count occurrences)
            const openCount = (line.match(/\(/g) || []).length;
            const closeCount = (line.match(/\)/g) || []).length;

            // Adjust depth based on unclosed parens in this line
            // Note: Simplistic approach. doesn't handle parens inside strings.
            if (!line.startsWith(')')) {
                // if line ends with '(', increase
                // simple heuristic: net change
                depth += (openCount - closeCount);
            }
        });

        return resultLines.join('\n').trim();
    }
};
