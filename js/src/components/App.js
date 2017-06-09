import React, { Component } from 'react';
import AlarmCreate from './AlarmCreate';
import AlarmList from './AlarmList'

export default class App extends Component {
    interval = null
    alarmLogic() {
        const {active_alarms} = this.props;

        if (!active_alarms.length) {
            clearInterval(this.interval);
            this.interval = null;
            return;
        }

        // if here, then there are alarms
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();

        active_alarms.filter((currentAlarm) => {
            const alarmDate = new Date(currentAlarm.time);
            return alarmDate.getHours() <= hours && alarmDate.getMinutes() <= minutes; 
        }).forEach((filteredAlarm) => {
            this.props.dispatch('INACTIVATE_ALARM', {
                time: filteredAlarm.time,
            });
            alert(filteredAlarm.name.toUpperCase());
        });
    }
    componentDidMount() {
        this.interval = setInterval(() => this.alarmLogic(), 1000);
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.active_alarms.length) {
            clearInterval(this.interval);
            this.interval = setInterval(() => this.alarmLogic(), 1000);
        }
        else if (nextProps.active_alarms.length === 0) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
    render() {
        return (<div>
            <AlarmCreate {...this.props} />  
            <AlarmList {...this.props} keyName="active_alarms"/>  
            <AlarmList {...this.props} keyName="inactive_alarms" classNames={['disabled']}/>  
        </div>);
    }
}
