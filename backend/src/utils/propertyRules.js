// Frontend and backend deploy independently. Contract tests keep these form rules aligned.
export const PROPERTY_RULES = {
  APARTMENT: {"areaLabel":"Built-up area (sq.ft)","bedrooms":true,"bathrooms":true,"roomsRequired":true,"details":["floorNumber","totalFloors","furnishing","parkingSpaces","facing"]},
  VILLA: {"areaLabel":"Built-up area (sq.ft)","bedrooms":true,"bathrooms":true,"roomsRequired":true,"details":["plotAreaSqft","totalFloors","furnishing","parkingSpaces","facing"]},
  ROW_HOUSE: {"areaLabel":"Built-up area (sq.ft)","bedrooms":true,"bathrooms":true,"roomsRequired":true,"details":["plotAreaSqft","totalFloors","furnishing","parkingSpaces","facing"]},
  PENTHOUSE: {"areaLabel":"Built-up area (sq.ft)","bedrooms":true,"bathrooms":true,"roomsRequired":true,"details":["floorNumber","totalFloors","furnishing","parkingSpaces","facing"]},
  PLOT: {"areaLabel":"Plot / land area (sq.ft)","details":["plotLengthFt","plotWidthFt","roadWidthFt","landUse","facing","boundaryWall","waterSupply","electricity"]},
  INDUSTRIAL_LAND: {"areaLabel":"Land area (sq.ft)","details":["plotLengthFt","plotWidthFt","roadWidthFt","boundaryWall","waterSupply","electricity"]},
  FARMHOUSE: {"areaLabel":"Total land area (sq.ft)","bedrooms":true,"bathrooms":true,"hint":"Enter the total land area above. Add the house area and rooms only if a house is built on the land.","details":["builtUpAreaSqft","roadWidthFt","boundaryWall","waterSupply","electricity","parkingSpaces"]},
  COMMERCIAL: {"areaLabel":"Built-up area (sq.ft)","bathrooms":true,"details":["floorNumber","totalFloors","furnishing","parkingSpaces"]},
  SHOP_SHOWROOM: {"areaLabel":"Shop / showroom area (sq.ft)","bathrooms":true,"details":["floorNumber","furnishing","parkingSpaces","roadWidthFt"]},
  WAREHOUSE: {"areaLabel":"Covered storage area (sq.ft)","bathrooms":true,"details":["plotAreaSqft","ceilingHeightFt","loadingAccess","roadWidthFt","electricity"]},
  PG_HOSTEL: {"areaLabel":"Built-up area (sq.ft)","bathrooms":true,"details":["roomCount","bedCapacity","totalFloors","furnishing","parkingSpaces"]},
  HOTEL_RESORT: {"areaLabel":"Built-up area (sq.ft)","bathrooms":true,"details":["roomCount","plotAreaSqft","totalFloors","furnishing","parkingSpaces"]}
}

export const DETAIL_RULES = {
  plotAreaSqft: {"label":"Plot area (sq.ft)","type":"number","min":0.01,"step":"any"},
  builtUpAreaSqft: {"label":"Built-up area (sq.ft)","type":"number","min":0.01,"step":"any"},
  plotLengthFt: {"label":"Plot length (ft)","type":"number","min":0.01,"step":"any"},
  plotWidthFt: {"label":"Plot width (ft)","type":"number","min":0.01,"step":"any"},
  roadWidthFt: {"label":"Access road width (ft)","type":"number","min":0.01,"step":"any"},
  floorNumber: {"label":"Floor number","type":"number","min":0,"step":"1"},
  totalFloors: {"label":"Total floors","type":"number","min":1,"step":"1"},
  parkingSpaces: {"label":"Parking spaces","type":"number","min":0,"step":"1"},
  roomCount: {"label":"Number of rooms","type":"number","min":1,"step":"1"},
  bedCapacity: {"label":"Bed capacity","type":"number","min":1,"step":"1"},
  ceilingHeightFt: {"label":"Clear ceiling height (ft)","type":"number","min":0.01,"step":"any"},
  furnishing: {"label":"Furnishing","type":"select","options":["Unfurnished","Semi-furnished","Furnished"]},
  facing: {"label":"Facing","type":"select","options":["North","South","East","West","North East","North West","South East","South West"]},
  landUse: {"label":"Land use","type":"select","options":["Residential","Commercial","Agricultural","Industrial","Mixed use"]},
  boundaryWall: {"label":"Boundary / fencing","type":"select","options":["Yes","No","Partial"]},
  waterSupply: {"label":"Water supply","type":"select","options":["Municipal","Borewell","Well","Tanker","Multiple sources","None"]},
  electricity: {"label":"Electricity connection","type":"select","options":["Available","Not available"]},
  loadingAccess: {"label":"Loading vehicle access","type":"select","options":["Small vehicles","Trucks","Containers","None"]}
}
