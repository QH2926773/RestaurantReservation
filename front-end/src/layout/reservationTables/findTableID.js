function findTableID(table_name, tables) {
    const foundTable = tables.find((table) => table.table_name === table_name);
    return foundTable.table_id;
  }
  
  export default findTableID;
  