/**
 *Class which is representing pagination fields.
 */
 class Pagination {    
    /**
     * 
     * @param {*} sortColumn 
     * @param {*} sortDirection 
     * @param {*} total
     * @param {*} pageSize 
     * @param {*} pageIndex
     * @param {*} hasMore
     */
    constructor(sortColumn, sortDirection ='asc', total = 1, pageSize = 10, pageIndex = 1, hasMore) {
        this.sortColumn = sortColumn;
        this.sortDirection = sortDirection;
        this.total = total;
        this.pageSize = pageSize;
        this.pageIndex = pageIndex;
        if (hasMore != null) {
            this.hasMore = hasMore;
        }
    }
}

module.exports = Pagination;
