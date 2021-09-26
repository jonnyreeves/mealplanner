function onOpen() {
  const spreadsheet = SpreadsheetApp.getActive();
  const menuItems = [
    { name: 'Update Shopping List', functionName: 'buildShoppingList' },
  ];
  spreadsheet.addMenu('Scripts', menuItems);
}

function onEdit(e) {
  const rg = e.range;
  if (rg.getA1Notation() === 'D2' && rg.isChecked() && rg.getSheet().getName() === 'Config') {
    buildShoppingList();
    rg.uncheck();
  }
}
