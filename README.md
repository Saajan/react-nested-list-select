# react-nesteds-list-select

A list with selectable and keyboard navigable items. Useful as a dropdown (autocomplete), right click menu, or a simple list with actions triggered on item select.

## WARNING : In major upgrade mode. multiple select is not working. Fork it to change or use old version.

Fork of [react-list-select](https://github.com/hawkrives/react-list-select).

View the [example](https://saajan.github.io/react-nested-list-select/).

## Use:

```js
import List from "react-nested-list-select";

let items = ["Google", "TED", "GitHub", "Big Think", "Microsoft"];

let list = (
  <List
    items={items}
    selected={[0]}
    disabled={[4]}
    multiple={true}
    onChange={(selected: number) => {
      console.log(selected);
    }}
  />
);

ReactDOM.renderComponent(list, document.getElementById("container"));
```

Supports array of objects but the object should include keys 'id' and 'name' or 'value';

i.e

```js
let items = [
  {
    id: "google",
    name: "Google"
  },
  {
    id: "ted",
    name: "TED"
  }
];
```

## API

#### .select(index)

- `number` **index** - _items_ array index

Select an item from the list

#### .deselect(index)

- `number` **index** - _items_ array index

Deselect an item from the list

#### .disable(index)

- `number` **index** - _items_ array index

Disable an item from the list to be selected or focused

#### .enable(index)

- `number` **index** - _items_ array index

Enable a disabled item to be focused or selected

#### .focusNext()

focus next item from the list

#### .focusPrevious()

focus previous item from the list

#### .focusIndex(index)

- `number` **index** - _items_ array index

Focus an item from the list

#### .clear()

Reset list state

## License - MIT
