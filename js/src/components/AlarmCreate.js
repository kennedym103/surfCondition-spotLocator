import React, { Component } from 'react';

export default class AlarmCreate extends Component {
	state = {
		name: '',
		time: 0,
		uiTime: '',
	}
	handleNameUpdate(e) {
		this.setState({
			name: e.target.value,
		})
	}
	handleTimeUpdate(e) {
		
		const timeValue = e.target.value; 
		const [hours, minutes] = timeValue.split(':');

		const dateNow = new Date();
		dateNow.setHours(hours);
		dateNow.setMinutes(minutes);

		this.setState({
			time: dateNow.getTime(),
			uiTime: timeValue,
		})
	}
	submit() {
		const {time, name} = this.state;
		this.props.dispatch('ADD_ALARM', {
			name,
			time,
		});
		this.setState({
			name: '',
			uiTime: '',
			time: 0,
		})
	}
	render() {
		const {name, uiTime} = this.state;
		return <div>
			<div className="ui fluid icon input">
			  <input type="text" 
			  		 value={name} 
			  		 placeholder="Alarm Name" 
			  		 onChange={(e) => this.handleNameUpdate(e)} />
			</div>
			<div className="ui fluid icon input">
			  <input type="time" 
			  	     value={uiTime} 
			  	     placeholder="Alarm Time" 
			  	     onChange={(e) => this.handleTimeUpdate(e)} />
			</div>
			<br />
			<div>
				<button className="ui button primary" 
						onClick={(e) => this.submit(e)}>Submit</button>
			</div>
		</div>
	}
}