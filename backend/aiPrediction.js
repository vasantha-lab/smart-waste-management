function predictCollection(fillLevel, history = []) {
  if (history.length === 0) {
    if (fillLevel >= 80) {
      return "Collection required immediately";
    }

    if (fillLevel >= 60) {
      return "Collection likely needed soon";
    }

    return "No immediate collection required";
  }

  const averageFill =
    history.reduce((sum, item) => sum + Number(item.fill_level), 0) /
    history.length;

  if (fillLevel >= 80 || averageFill >= 75) {
    return "Collection required soon based on fill history";
  }

  if (fillLevel >= 60 || averageFill >= 55) {
    return "Collection likely needed soon based on history";
  }

  return "No immediate collection required based on history";
}

module.exports = {
  predictCollection,
};