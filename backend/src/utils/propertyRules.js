// Frontend and backend deploy independently. Contract tests keep these form rules aligned.
export const PROPERTY_RULES = {
  APARTMENT: {"areaLabel":"Built-up area (sq.ft)","bedrooms":true,"bathrooms":true,"roomsRequired":true,"details":["carpetAreaSqft","floorNumber","totalFloors","furnishing","parkingSpaces","facing"]},
  VILLA: {"areaLabel":"Built-up area (sq.ft)","bedrooms":true,"bathrooms":true,"roomsRequired":true,"details":["plotAreaSqft","totalFloors","furnishing","parkingSpaces","facing"]},
  ROW_HOUSE: {"areaLabel":"Built-up area (sq.ft)","bedrooms":true,"bathrooms":true,"roomsRequired":true,"details":["plotAreaSqft","totalFloors","furnishing","parkingSpaces","facing","naStatus"]},
  PENTHOUSE: {"areaLabel":"Built-up area (sq.ft)","bedrooms":true,"bathrooms":true,"roomsRequired":true,"details":["floorNumber","totalFloors","furnishing","parkingSpaces","facing"]},
  PLOT: {"areaLabel":"Plot / land area (sq.ft)","details":["plotLengthFt","plotWidthFt","roadWidthFt","landUse","facing","boundaryWall","waterSupply","electricity","plotType","naStatus"]},
  INDUSTRIAL_LAND: {"areaLabel":"Land area (sq.ft)","details":["plotLengthFt","plotWidthFt","roadWidthFt","boundaryWall","waterSupply","electricity"]},
  FARMHOUSE: {"areaLabel":"Total land area (sq.ft)","bedrooms":true,"bathrooms":true,"hint":"Enter the total land area above. Add the house area and rooms only if a house is built on the land.","details":["builtUpAreaSqft","roadWidthFt","boundaryWall","waterSupply","electricity","parkingSpaces"]},
  COMMERCIAL: {"areaLabel":"Built-up area (sq.ft)","bathrooms":true,"details":["floorNumber","totalFloors","furnishing","parkingSpaces"]},
  SHOP_SHOWROOM: {"areaLabel":"Shop / showroom area (sq.ft)","bathrooms":true,"details":["floorNumber","furnishing","parkingSpaces","roadWidthFt","carpetAreaSqft","builtUpAreaSqft","floorLevel","liftAvailability"]},
  WAREHOUSE: {"areaLabel":"Covered storage area (sq.ft)","bathrooms":true,"details":["plotAreaSqft","ceilingHeightFt","loadingAccess","roadWidthFt","electricity"]},
  PG_HOSTEL: {"areaLabel":"Built-up area (sq.ft)","bathrooms":true,"details":["roomCount","bedCapacity","totalFloors","furnishing","parkingSpaces"]},
  HOTEL_RESORT: {"areaLabel":"Built-up area (sq.ft)","bathrooms":true,"details":["roomCount","plotAreaSqft","totalFloors","furnishing","parkingSpaces"]},
  OFFICE_SPACE: {"areaLabel":"Built-up area (sq.ft)","bathrooms":true,"details":["carpetAreaSqft","floorNumber","totalFloors","parkingSpaces","liftAvailability","furnishing"]},
  COMMERCIAL_BUILDING: {"areaLabel":"Built-up area (sq.ft)","bathrooms":true,"details":["plotAreaSqft","totalFloors","parkingSpaces","liftAvailability"]},
  AGRICULTURAL_LAND: {"areaLabel":"Land area","areaUnits":true,"details":["landArea","landAreaUnit","village","taluka","district","surveyNumber","roadFrontageFt","roadAccess","landUse"]}
}

export const DETAIL_RULES = {
  carpetAreaSqft: {"label":"Carpet area (sq.ft)","type":"number","min":0.01,"step":"any"},
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
  loadingAccess: {"label":"Loading vehicle access","type":"select","options":["Small vehicles","Trucks","Containers","None"]},
  naStatus: {"label":"NA (non-agricultural) status","type":"select","options":["Approved","Not approved","Application pending","Not applicable","Not known"]},
  plotType: {"label":"Plot type","type":"select","options":["Residential","Commercial"]},
  floorLevel: {"label":"Floor level","type":"select","options":["Ground floor","Upper floor","Basement"]},
  liftAvailability: {"label":"Lift availability","type":"select","options":["Available","Not available"]},
  landArea: {"label":"Land area","type":"number","min":0.000001,"step":"any"},
  landAreaUnit: {"label":"Land area unit","type":"select","options":["Acres","Hectares","Guntha"]},
  village: {"label":"Village","type":"text","maxLength":120},
  taluka: {"label":"Taluka","type":"text","maxLength":120},
  district: {"label":"District","type":"text","maxLength":120},
  surveyNumber: {"label":"Survey number / Gat number","type":"text","maxLength":120},
  roadFrontageFt: {"label":"Road frontage (ft)","type":"number","min":0.01,"step":"any"},
  roadAccess: {"label":"Road access","type":"select","options":["Direct public road","Private access road","Right of way","No road access","Not known"]}
}

export const LAND_AREA_UNITS = {"Acres":43560,"Hectares":107639.10416709722,"Guntha":1089}
