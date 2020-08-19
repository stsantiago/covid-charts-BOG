export async function getData() {
  const response = await fetch(
    "https://www.datos.gov.co/resource/gt2j-8ykr.json?$limit=1000000&$where=ciudad_de_ubicaci_n like 'Bogotá D.C.' and fecha_diagnostico between '2020-01-01T00:00:00' and '2020-12-31T00:00:00'"
  );
  // const response = await fetch("./Covid20200812.json");
  const data = await response.json();
  return data;
}

export function sortByDate(data) {
  return import(
    "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.15/lodash.min.js"
  ).then(() => {
    const Leve = _.sortBy(Object.values(data.Leve), ["date"]);
    const Moderado = _.sortBy(Object.values(data.Moderado), ["date"]);
    const Grave = _.sortBy(Object.values(data.Grave), ["date"]);
    const Fallecido = _.sortBy(Object.values(data.Fallecido), ["date"]);
    // const FallecidoNa = _.sortBy(Object.values(data["N/A"]), ["date"]);
    return {
      Leve,
      Moderado,
      Grave,
      Fallecido,
      // FallecidoNa,
    };
  });
}

export async function getTotalCasesByDate() {
  const data = await getData();

  const dataByDate = {
    Leve: {},
    Moderado: {},
    Grave: {},
    Asintomático: {},
    Fallecido: {},
    "N/A": {},
  };
  data.forEach((item) => {
    try {
      dataByDate[item.estado][item.fecha_diagnostico]
        ? dataByDate[item.estado][item.fecha_diagnostico].cases++
        : (dataByDate[item.estado][item.fecha_diagnostico] = {
            cases: 1,
            date: `${item.fecha_diagnostico}`,
          });
    } catch {}
  });

  const dataSortByDate = await sortByDate(dataByDate);
  const dataByState = {
    Leve: {},
    Moderado: {},
    Grave: {},
    Asintomático: {},
    Fallecido: {},
    "N/A": {},
  };
  Object.entries(dataSortByDate).forEach(([key, value]) => {
    let cases = 0;
    Object.entries(value).forEach((item) => {
      try {
        cases = cases + item[1].cases;
        dataByState[key] ? dataByState[key].cases + cases : item[1].cases;
        dataByState[key][item[1].date] = {
          cases: cases,
          date: `${item[1].date}`,
        };
      } catch {}
    });
  });

  return await sortByDate(dataByState);
}
