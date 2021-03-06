import * as React from 'react'
import cx from 'classnames'

export class ListItem extends React.Component {
	static defaultProps = {
		disabled: false,
		selected: false,
		focused: false,
	}

	handleMouseOver = () => {
		this.props.onMouseOver(this.props.index, this.props.selectedItem);
	}

	handleChange = (ev) => {
		this.props.onChange({ event: ev, index: this.props.index, item: this.props.selectedItem });
	}

	render() {
		let props = this.props;
		let classes = cx('react-list-select--item', {
			'is-disabled': props.disabled,
			'is-selected': props.selected,
			'is-focused': props.focused,
		});
		return (
			<li
				className={classes}
				onMouseOver={this.handleMouseOver}
				onClick={this.handleChange}
			>
				{props.children}
			</li>
		)
	}
}
