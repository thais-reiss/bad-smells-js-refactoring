class CsvFormatter {
  buildHeader() {
    return 'ID,NOME,VALOR,USUARIO\n';
  }

  buildRow(item, user) {
    return `${item.id},${item.name},${item.value},${user.name}\n`;
  }

  buildFooter(total) {
    return `\nTotal,,\n${total},,\n`;
  }
}

class HtmlFormatter {
  buildHeader(user) {
    let header = '<html><body>\n';
    header += '<h1>Relatório</h1>\n';
    header += `<h2>Usuário: ${user.name}</h2>\n`;
    header += '<table>\n';
    header += '<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n';
    return header;
  }

  buildRow(item, user) {
    if (user.role === 'ADMIN') {
      const style = item.priority ? 'style="font-weight:bold;"' : '';
      return `<tr ${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
    }
    return `<tr><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
  }

  buildFooter(total) {
    let footer = '</table>\n';
    footer += `<h3>Total: ${total}</h3>\n`;
    footer += '</body></html>\n';
    return footer;
  }
}

function createFormatter(reportType) {
  if (reportType === 'CSV') return new CsvFormatter();
  if (reportType === 'HTML') return new HtmlFormatter();
  throw new Error(`Tipo de relatório desconhecido: ${reportType}`);
}

export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  generateReport(reportType, user, items) {
    const formatter = createFormatter(reportType);

    const visibleItems = this.filterItemsByRole(user, items);
    const { rows, total } = this.buildRows(formatter, user, visibleItems);

    const header = formatter.buildHeader(user);
    const footer = formatter.buildFooter(total);

    return (header + rows + footer).trim();
  }

  filterItemsByRole(user, items) {
    if (user.role === 'ADMIN') {
      return items.map((item) => {
        if (item.value > 1000) item.priority = true;
        return item;
      });
    }

    if (user.role === 'USER') {
      return items.filter((item) => item.value <= 500);
    }

    return [];
  }

  buildRows(formatter, user, items) {
    let rows = '';
    let total = 0;

    for (const item of items) {
      rows += formatter.buildRow(item, user);
      total += item.value;
    }

    return { rows, total };
  }
}