# IO Database System

## Purpose

Editor-driven content management system for game objects with metadata.

## Components

### IdentifiedObject (Base ScriptableObject)

```csharp
public class IdentifiedObject : ScriptableObject
{
    Category[] categories;
    int id;
    Sprite icon;
    string codeName;
    string displayName;
    string description;

    // Methods
    bool HasCategory(Category category);
    IdentifiedObject Clone();
    JObject ToJsonObject();
    void FromJsonObject(JObject json);
}
```

### Category

```csharp
public class Category : IdentifiedObject
{
    // Supports string comparison: category == "MyCategory" (compares CodeName)
}
```

### IODatabase (ScriptableObject)

```csharp
public class IODatabase : ScriptableObject
{
    List<IdentifiedObject> entries;

    void Add(IdentifiedObject entry);
    void Remove(IdentifiedObject entry);
    IdentifiedObject GetDataByID(int id);
    string GetDataCodeName(int id);
    bool Contains(IdentifiedObject entry);
    void SortByCodeName();
}
```

## Usage Pattern

1. Create `IODatabase` asset (e.g., `ItemDatabase.asset`)
2. Create `IdentifiedObject` subclasses for your content
3. Add entries to the database via Inspector or Editor window
4. Query at runtime:

```csharp
var item = database.GetDataByID(itemId);
```

## With SerializeReference Extensions (MackySoft)

Use `[SubclassSelector]` for polymorphic fields in Inspector:

```csharp
[SerializeReference, SubclassSelector]
private IEffect effect;
// Inspector shows dropdown: DamageEffect, HealEffect, BuffEffect, etc.
```

This requires the MackySoft.SerializeReferenceExtensions plugin (included in `Assets/Plugins/MackySoft/`).

## Editor Support

- `IdentifiedObjectEditor` — Custom inspector for IdentifiedObject
- `CustomEditorUtility` — GUI helpers (foldouts, underlines, folder management)
- `TableView` attribute for list display with CSV export
