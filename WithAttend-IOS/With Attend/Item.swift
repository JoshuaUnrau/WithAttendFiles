import Foundation
import CoreLocation

struct ItemConstant {
  static let nameKey = "name"
  static let uuidKey = "uuid"
  static let majorKey = "major"
  static let minorKey = "minor"
}

class Item: NSObject, NSCoding {
  let name: String
  let uuid: UUID
  dynamic var lastSeenBeacon: CLBeacon?
  
  init(name: String, uuid: UUID) {
    self.name = name
    self.uuid = uuid
  }

  // MARK: NSCoding
  required init?(coder aDecoder: NSCoder) {
    if let aName = aDecoder.decodeObject(forKey: ItemConstant.nameKey) as? String {
      name = aName
    }
    else {
      name = ""
    }
    if let aUUID = aDecoder.decodeObject(forKey: ItemConstant.uuidKey) as? UUID {
      uuid = aUUID
    }
    else {
      uuid = UUID()
    }
  }
  
  func encode(with aCoder: NSCoder) {
    aCoder.encode(name, forKey: ItemConstant.nameKey)
    aCoder.encode(uuid, forKey: ItemConstant.uuidKey)
}
  
}

func ==(item: Item, beacon: CLBeacon) -> Bool {
    return ((beacon.proximityUUID.uuidString == item.uuid.uuidString))
}

