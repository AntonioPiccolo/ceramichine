function invertDate(dateString) {
  const [datePart, timePart] = dateString.split(" ");
  const [month, day, year] = datePart.split("/");
  const invertedDate = `${day}/${month}/${year}`;
  return `${invertedDate} ${timePart}`;
}

module.exports = { invertDate };
