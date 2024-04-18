

module.exports = {
    getMQL,
    validateFQL,
}

/**
 * 
 * @param {*} filters 
 * @return {*} MQL
 */
function getMQL(filters) {
    if (!filters || !Array.isArray(filters) || filters.length == 0) {
        return {};
    }
    const operators = [];
    const queries = [];
    let operator; let query1; let query2; let filter;

    for (filter of filters) {
        if (typeof filter == 'string') filter = filter.toLowerCase();
        switch (filter) {
        case '(':
            operators.push(filter);
            break;
        case ')':
            operator = operators.pop();
            while (operators.length > 0 && operator != '(') {
                if (operator == 'and') {
                    query1 = queries.pop();
                    query2 = queries.pop();
                    queries.push({$and: [query1, query2]});
                } else if (operator == 'or') {
                    query1 = queries.pop();
                    query2 = queries.pop();
                    queries.push({$or: [query1, query2]});                
                }
                operator = operators.pop();
            }
            break;
        case 'and':
            operators.push(filter);
            break;
        case 'or':
            while (operators.length > 0 && operators[operators.length-1] == 'and' ) {
                query1 = queries.pop();
                query2 = queries.pop();
                queries.push({$and: [query1, query2]});
                operators.pop();
            }
            operators.push(filter);
            break;
        default:
            queries.push(filter);
            break;
        }
    }
    
    while (operators.length > 0) {
        operator = operators.pop();
        if (operator == 'and') {
            query1 = queries.pop();
            query2 = queries.pop();
            queries.push({$and: [query1, query2]});
        } else if (operator == 'or') {
            query1 = queries.pop();
            query2 = queries.pop();
            queries.push({$or: [query1, query2]});                
        }
    }

    return queries[0];
};

/**
 * 
 * @param {*} fql 
 * @return {*} isFQLValid or not
 */
function validateFQL(fql) {
    if (!fql || !Array.isArray(fql) || fql.length == 0) return true;
    const stack = [];
    let item; let i = 0;
    if (typeof fql[0] == 'string' && (fql[0].toLowerCase() == 'and' || fql[0].toLowerCase() == 'or')) return false;
    for (i; i<fql.length; i++) {
        item = fql[i];
        if (typeof item == 'string') item = item.toLowerCase();
        const nextItem = i < fql.length-1 ? fql[i+1] : undefined;
        switch (item) {
        case 'and':
        case 'or':
            if (typeof nextItem != 'object' && nextItem != '(') return false;
            break;
        case '(':
            if (typeof nextItem != 'object' && nextItem != '(') return false;
            stack.push('(');
            break;
        case ')':
            if (typeof nextItem == 'object' || nextItem == '(' || stack.length == 0) return false;
            stack.pop();
            break;        
        default:
            if (typeof nextItem == 'object' || nextItem == '(') return false;
            break;
        }
    }
    
    if (stack.length > 0) return false;

    return true;
};
