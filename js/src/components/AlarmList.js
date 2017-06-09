import React, { Component } from 'react';

export default class AlarmList extends Component {
	render() {
		console.log(this.props.active_alarms)
		return <div className="ui segments">
			{this.renderAlarms()}
		</div>
	}
	renderAlarms() {
        const {keyName} = this.props;
		return this.props[keyName].map((currAlarm, index) => {
			const {name, time} = currAlarm;

			return <div key={index} className={"ui segment " + (this.props.classNames || []).join(' ')}>
				<h1>{index+1}. {name}</h1>
				<p className="ui desc">{new Date(time).toString()}</p>
			</div>	
		});
	}
}
