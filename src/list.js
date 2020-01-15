// Thanks to https://gist.github.com/DelvarWorld/3784055
// for the inspiration for the shift-selection

import * as React from "react";
import cx from "classnames";
import includes from "lodash/includes";
import range from "lodash/range";
import reject from "lodash/reject";
import uniq from "lodash/uniq";
import { KEYS, KEY } from "./keys";
import { ListItem } from "./list-item";

export default class List extends React.Component {
  static defaultProps = {
    items: [],
    selected: [],
    selectedItem: [],
    disabled: [],
    multiple: false,
    search: false,
    onChange: () => { },
    keyboardEvents: true
  };

  state = {
    items: this.props.items,
    searchValue: "",
    selectedIndexes: this.props.selected,
    selectedItems: this.props.selectedItem,
    disabledItems: this.props.disabled,
    focusedIndex: null,
    lastSelected: null
  };

  componentWillReceiveProps(nextProps) {
    this.setState(() => ({
      items: nextProps.items,
      selectedIndexes: nextProps.selected,
      selectedItems: nextProps.selectedItem,
      disabledItems: nextProps.disabled
    }));
  }

  clear = () => {
    this.setState(() => ({
      selectedIndexes: [],
      selectedItems: [],
      disabledItems: [],
      focusedIndex: null,
      lastSelected: null,
      lastSelectedItem: null
    }));
  };

  select = ({ index, selectedItem, contiguous = false }) => {
    if (index === null) {
      return;
    }
    if (includes(this.state.disabledItems, index)) {
      return;
    }
    this.setState(
      state => {
        let { multiple } = this.props;
        let { lastSelected, lastSelectedItem } = state;
        let selectedIndexes = multiple ? [...state.selectedIndexes, index] : [index];
        let selectedItems = multiple ? [...state.selectedItems, selectedItem] : [selectedItem];
        if (contiguous && multiple && typeof lastSelected === "number") {
          let start = Math.min(lastSelected, index);
          let end = Math.max(lastSelected, index);
          selectedIndexes = uniq([...selectedIndexes, ...range(start, end + 1)]);
        }
        return { selectedIndexes, lastSelected: index, selectedItems, lastSelectedItem: lastSelectedItem };
      },
      () => {
        this.props.onChange(this.props.multiple ? (this.state.selectedIndexes, this.state.selectedItems) : (this.state.lastSelected, this.state.lastSelectedItem));
      }
    );
  };

  deselect = ({ index, selectedItem, contiguous = false }) => {
    if (index === null) {
      return;
    }
    this.setState(
      state => {
        let { multiple } = this.props;
        let { selectedIndexes, selectedItems, lastSelected, lastSelectedItem } = state;
        if (contiguous && multiple && typeof lastSelected === "number") {
          let start = Math.min(lastSelected, index);
          let end = Math.max(lastSelected, index);
          let toDeselect = range(start, end + 1);
          selectedIndexes = reject(selectedIndexes, idx =>
            includes(toDeselect, idx)
          );
        } else {
          selectedIndexes = reject(selectedIndexes, idx => idx === index);
          selectedItems = reject(selectedItems, item => item.key === selectedItem.key);
        }
        return { selectedIndexes, selectedItems, lastSelected: index, lastSelectedItem: lastSelectedItem };
      },
      () => {
        this.props.onChange(
          this.props.multiple ? (this.state.selectedIndexes, this.state.selectedItems) : (null, null)
        );
      }
    );
  };

  disable = (index) => {
    this.setState(({ disabledItems }) => {
      let indexOf = disabledItems.indexOf(index);
      return {
        disabledItems: [...disabledItems].splice(indexOf, 1)
      };
    });
  };

  disable = (index) => {
    this.setState(state => ({
      disabledItems: [...state.disabledItems, index]
    }));
  };

  focusIndex = (index) => {
    this.setState(state => {
      if (index === null) {
        return {};
      }
      let { focusedIndex, disabledItems } = state;
      if (!includes(disabledItems, index) && typeof index === "number") {
        focusedIndex = index;
      }
      return { focusedIndex };
    });
  };

  focusPrevious = () => {
    this.setState(state => {
      let { focusedIndex, disabledItems } = state;
      let lastItem = state.items.length - 1;
      if (focusedIndex === null) {
        focusedIndex = lastItem;
      } else {
        // focus last item if reached the top of the list
        focusedIndex = focusedIndex <= 0 ? lastItem : focusedIndex - 1;
      }
      // skip disabled items
      if (disabledItems.length) {
        while (includes(disabledItems, focusedIndex)) {
          focusedIndex = focusedIndex <= 0 ? lastItem : focusedIndex - 1;
        }
      }
      return { focusedIndex };
    });
  };

  focusNext = () => {
    this.setState(state => {
      let { focusedIndex, disabledItems } = state;
      let lastItem = state.items.length - 1;
      if (focusedIndex === null) {
        focusedIndex = 0;
      } else {
        // focus first item if reached last item in the list
        focusedIndex = focusedIndex >= lastItem ? 0 : focusedIndex + 1;
      }
      // skip disabled items
      if (disabledItems.length) {
        while (includes(disabledItems, focusedIndex)) {
          focusedIndex = focusedIndex >= lastItem ? 0 : focusedIndex + 1;
        }
      }
      return { focusedIndex };
    });
  };

  onKeyDown = (event) => {
    let key = event.keyCode;
    if (key === KEY.UP || key === KEY.K) {
      this.focusPrevious();
    } else if (key === KEY.DOWN || key === KEY.J) {
      this.focusNext();
    } else if (key === KEY.SPACE) {
      this.toggleKeyboardSelect({
        event,
        index: this.state.focusedIndex
      });
    }
    // prevent default behavior where in some situations pressing the
    // key up / down would scroll the browser window
    if (includes(KEYS, key)) {
      event.preventDefault();
    }
  };

  toggleSelect = (args) => {
    let { contiguous, index } = args;
    if (index === null) {
      return;
    }
    if (!includes(this.state.selectedIndexes, index)) {
      this.select({ index, contiguous });
    } else if (this.props.multiple) {
      this.deselect({ index, contiguous });
    }
  };

  handleSearch = (e) => {
    this.setState({ searchValue: e.target.value });
  }

  handleSearchKeyPress = (e) => {
    if (e.keyCode == 13) {
      let searchInput = this.state.searchValue.toLowerCase();
      const searchResult = this.props.items.filter(value => {
        if (value != null && value.constructor.name === "Object" && !React.isValidElement(value)) {
          return value.name.split(' ').some(token => token.toLowerCase().startsWith(searchInput));
        } else {
          return value.split(' ').some(token => token.toLowerCase().startsWith(searchInput));
        }
      });
      this.setState({
        items: searchResult
      });
    }
  }

  handleSearchReset = () => {
    if (this.state.searchValue === "") {
      this.setState({
        items: this.props.items
      });
    }
  }

  toggleKeyboardSelect = (args) => {
    let { event, index } = args;
    event.preventDefault();
    let shift = event.shiftKey;
    this.toggleSelect({ contiguous: shift, index });
  };

  toggleMouseSelect = (args) => {
    let { event, index } = args;
    event.preventDefault();
    let shift = event.shiftKey;
    this.toggleSelect({ contiguous: shift, index });
  };

  render() {
    let { search } = this.props;
    let filteredItems = this.state.items.map((itemContent, index) => {
      let disabled = includes(this.state.disabledItems, index);
      let selected = includes(this.state.selectedIndexes, index);
      let selectedItem = itemContent;
      let focused = this.state.focusedIndex === index;
      if (itemContent != null && itemContent.constructor.name === "Object" && !React.isValidElement(itemContent)) {
        return (
          <ListItem
            key={index}
            index={index}
            selectedItem={selectedItem}
            disabled={disabled}
            selected={selected}
            focused={focused}
            onMouseOver={this.focusIndex}
            onChange={this.toggleMouseSelect}
          >
            {itemContent.name || itemContent.value}
          </ListItem>
        );
      } else {
        return (
          <ListItem
            key={index}
            index={index}
            disabled={disabled}
            selected={selected}
            selectedItem={selectedItem}
            focused={focused}
            onMouseOver={this.focusIndex}
            onChange={this.toggleMouseSelect}
          >
            {itemContent}
          </ListItem>
        );
      }
    });

    let searchBox = (<li><input value={this.state.searchValue} placeholder="Search" onKeyDown={this.handleSearchKeyPress} onKeyUp={this.handleSearchReset} onChange={this.handleSearch} className="sn-list-search-box"></input></li>);

    return (
      <ul
        className={cx("react-list-select", this.props.className)}
        tabIndex={0}
        onKeyDown={this.props.keyboardEvents ? this.onKeyDown : undefined}
      >
        {search ? searchBox : null}
        {filteredItems}
      </ul>
    );
  }
}
