import React, { useState, useEffect, forwardRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import $ from 'jquery';
import '../../stylesheets/ListApp.css';

const ListApp = forwardRef((props, ref) => {
	const [roomLists, setRoomLists] = useState([]);
	const [currentListItems, setCurrentListItems] = useState([]);
	const [currentList, setCurrentList] = useState(null);
	const [insideList, setInisdeList] = useState(false);
	const ws = ref;

	useEffect(() => {
		if (!ws.current) return;

		ws.current.onmessage = e => {
			const data = JSON.parse(e.data);

			if (data.command === 'fetched_lists') {
				console.log('fetched_lists', data.lists);
				setRoomLists(data.lists);

			} else if(data.command === 'fetched_list_items') {
				console.log('fetched_list_items', data.items);
				setCurrentListItems(data.items);

			} else if (data.command === 'new_list' || data.command === 'removed_list') {
				console.log('new_list or removed_list');
				console.log('fetching lists after overall list changes');
				if (data.command === 'new_list' && data.username === props.userInfo.username) {
					setCurrentList(data.list);
				}
				ws.current.send(JSON.stringify({
					command: 'fetch_lists', 
					username: props.userInfo.username || JSON.parse(localStorage.getItem('user')).username
				}));

			} else if (data.command === 'new_list_item_added') {
				console.log('new_list_item_added', data.item);
				if (currentList !== null && insideList && currentList.id === data.item.list_id) {
					ws.current.send(JSON.stringify({
						command: 'get_list_items',
						list_id: data.item.list_id
					}));
				}

			} else if (data.command === 'removed_list_item') {
				console.log('removed_list_item');
				
				// remove only if different user and current list is the same as the removed item's list
				if (currentList !== null && insideList && currentList.id === data.list_id) {
					setCurrentListItems(currentListItems.filter(item => item.id !== data.item_id));
				}

			} else if (data.command === 'updated_item_checked') {
				console.log('updated_item_checked from', data.username);
				if (props.userInfo.username !== data.username) {
					$('#item'+data.item.id).prop('checked', data.item.checked);
				}

			} else if (data.command === 'updated_item_content') {
				console.log('updated_item_content from', data.username);
				if (currentList !== null && insideList && currentList.id === data.list_id) {
					ws.current.send(JSON.stringify({
						command: 'get_list_items',
						list_id: data.list_id
					}));
				}
			}
			else {
				console.log('data.command invalid or not set');
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [roomLists, currentListItems]);
	
	// ---------------------------------------------
	// Handler Functions
	// ---------------------------------------------

	const handleListDetailsClick = (e, list) => {
		if(e.target.id === ('list-button-' + list.id)) {
			e.preventDefault();
			e.stopPropagation();
		} else {
			ws.current.send(JSON.stringify({
				command: 'get_list_items',
				list_id: list.id
			}));
			setCurrentList(list);
			setInisdeList(true);
		}
	};

	const handleBackToLists = () => {
		setCurrentList(null);
		setCurrentListItems([]);
		setInisdeList(false);
	};


	const handleRemoveList = (listID) => {
		console.log('remove list:', listID);
		ws.current.send(JSON.stringify({
			'command': 'remove_list',
			'list_id': listID
		}));
	};

	const handleRemoveItem = (itemID) => {
		console.log('remove item:', itemID);
		ws.current.send(JSON.stringify({
			'command': 'remove_list_item',
			'item_id': itemID,
		}));
	};

	const [currentItemContent, setCurrentItemContent] = useState('');
	const [currentItemEditID, setCurrentItemEditID] = useState('');
	const handleEditItem = (itemID, itemContent) => {
		if (currentItemEditID !== '') {
			setCurrentItemContent('');
			setCurrentItemEditID('');
			$('#item-edit-form-' + currentItemEditID).hide();
			$('#item-content-' + currentItemEditID).show();
		}
		setCurrentItemContent(itemContent);
		setCurrentItemEditID(itemID);
		$('#item-content-' + itemID).hide();
		$('#item-edit-form-' + itemID).show();
	};

	const handleEditItemSubmit = (event, itemID, itemContent) => {
		event.preventDefault();
		if (currentItemContent !== itemContent) {
			ws.current.send(JSON.stringify({
				'command': 'update_item_content',
				'item_id': itemID,
				'item_content': currentItemContent,
				'username': props.userInfo.username || JSON.parse(localStorage.getItem('user')).username
			}));
			$('#item-content-' + itemID).text(currentItemContent);
		}
		
		setCurrentItemContent('');
		setCurrentItemEditID('');
		$('#item-edit-form-' + itemID).hide();
		$('#item-content-' + itemID).show();
	};

	const handleChecked = (itemID) => {
		// Change to checked for the item
		console.log('toggle item check:', itemID);
		ws.current.send(JSON.stringify({
			'command': 'update_item_checked',
			'item_id': itemID,
			'username': props.userInfo.username || JSON.parse(localStorage.getItem('user')).username
		}));
	};

	const [listTitleInput, setListTitleInput] = useState('');
	const handleListTitleSubmit = (event) => {
		event.preventDefault();
		ws.current.send(JSON.stringify({
			'command': 'new_list',
			'title': listTitleInput,
			'username': props.userInfo.username || JSON.parse(localStorage.getItem('user')).username
		}));
		console.log('New List called', listTitleInput);
		setCurrentList({title: listTitleInput});
		setInisdeList(true);
		setListTitleInput('');

		// Dismiss the modal after submitting
		$('#newListModal').modal('toggle');
	};

	const [newItemInput, setNewItemInput] = useState('');
	const handleNewItemSubmit = (event) => {
		event.preventDefault();
		console.log('handleNewItemSubmit list id', currentList.id);
		ws.current.send(JSON.stringify({
			'command': 'new_list_item',
			'content': newItemInput,
			'list_id': currentList.id
		}));
		console.log('New List Item', newItemInput);
		setNewItemInput('');
	};

	const [displayItemForm, setDisplayItemForm] = useState(false);
	const listAppCardBodyClasses = 'card-body list-app-card-body' + (displayItemForm ? ' pad-bot' : '');

	// ---------------------------------------------
	// Sub Components
	// ---------------------------------------------

	const insideListView = (
		<div className={listAppCardBodyClasses} style={{backgroundColor: '#ffffff'}} >
			<h4 className="text-center mb-3">{currentList !== null ? currentList.title : null}</h4>
			
			{currentListItems.map((item, index) => 
				<div className={'list-app-item p-2 d-flex align-items-center justify-content-between' + (index === 0 ? ' first-item' : '')}
					onMouseOver={() => $('#list-item-options' + item.id).css('visibility','visible')}
					onMouseLeave={() => $('#list-item-options' + item.id).css('visibility','hidden')}
					key={item.id} >
					<div style={{width: '80%'}}>
						<input type="checkbox" defaultChecked={item.checked} className="list-checkbox" id={'item' + item.id} onClick={() => handleChecked(item.id)}/>
						<label className="list-checkbox-label" 
							htmlFor={'item' + item.id}
						>
							<span id={'item-content-' + item.id}>{item.content}</span>
							<form onSubmit={event => handleEditItemSubmit(event, item.id, item.content)} className='normally-display-none item-form m-0' id={'item-edit-form-' + item.id}>
								<div className="item-form-group d-flex align-items-center m-0">
									<label htmlFor={'item-content-input-' + item.id} className="col-form-label" aria-label="List Name" style={{display: 'none'}}></label>
									<input ref={input => input && input.focus()} type="text" className="edit-input form-control" id={'item-content-input-' + item.id} value={currentItemContent} onChange={({ target }) => setCurrentItemContent(target.value)}/>
									<button type="submit" className="edit-item-submit ml-2">Save</button>
								</div>
								
							</form>
						</label>
					</div>
					
					<div id={'list-item-options' + item.id} className="normally-hidden item-icons">
						<span 
							role="button"
							id={'list-item-edit-icon-' + item.id}
							className="list-item-edit-icon mr-3"
							onClick={() => handleEditItem(item.id, item.content)}
						>
							<FontAwesomeIcon icon={['fas', 'edit']}/>
						</span>
						<span 
							role="button"
							className="list-item-remove-icon"
							onClick={() => handleRemoveItem(item.id)}
						>
							<FontAwesomeIcon icon={['fas', 'trash-alt']}/>
						</span>
					</div>
				</div>
			)}

			{displayItemForm
				? 
				<div className="create-item-form px-4">
					<form onSubmit={handleNewItemSubmit}>
						<div className="form-group">
							<label htmlFor="item-content" className="col-form-label" aria-label="List Name" style={{display: 'none'}}></label>
							<input type="text" className="form-control" id="item-content" placeholder="Add an item" value={newItemInput} onChange={({ target }) => setNewItemInput(target.value)}/>
						</div>
						<div style={{float: 'right'}}>
							<button type="button" className="btn list-app-btn-grey mr-2" onClick={() => setDisplayItemForm(false)}>Cancel</button>
							<button type="submit" className="btn new-list-item-btn">Save</button>
						</div>
					</form>
				</div>
				: null
			}
		</div>
	);

	const allListsView = (
		<div className="card-body list-app-card-body" style={{backgroundColor: '#ecf4ff'}}>
			<div>
				{roomLists.map(list => 
					<div className="list-item mb-3 pr-3 d-flex flex-row align-items-center justify-content-between" 
						key={list.id} role="button" 
						onMouseOver={() => $('#list-button-' + list.id).show()}
						onMouseLeave={() => $('#list-button-' + list.id).hide()}
					>
						<div className="p-3 d-flex align-items-center" style={{width: '85%', height: '100%'}}
							onClick={e => handleListDetailsClick(e, list)}
						>
							{list.title}
						</div>
						<button id={'list-button-' + list.id} className="normally-display-none btn canvas-btn" name="removeButton" onClick={() => handleRemoveList(list.id)}>
							<FontAwesomeIcon icon={['fas', 'trash-alt']}/>
						</button>
					</div>
				)}
			</div>
		</div>
	);

	const insideListButtons = (
		<div>
			<div className="list-app-btn btn mr-3" onClick={handleBackToLists} role='button'>
				<div className="justify-content-center h-100 d-flex align-items-center">
					&#8592; All Lists
				</div>
			</div>
			<div className="new-list-item-btn btn mr-3" onClick={() => setDisplayItemForm(true)} role='button'>
				<div className="justify-content-center h-100 d-flex align-items-center">
					<FontAwesomeIcon icon={['fas', 'plus']}/>
				</div>
			</div>
		</div>
	);

	const createNewListButton = (
		<div className="list-app-btn btn mr-3" role='button' data-toggle="modal" data-target="#newListModal">
			<div className="justify-content-center h-100 d-flex align-items-center">
				{'+'} New
			</div>
		</div>
	);

	// ---------------------------------------------
	// Render
	// ---------------------------------------------

	return (
		<div className="list-app-card card shadow mb-4">
			<div className='list-app-header card-header py-3 d-flex flex-row align-items-center justify-content-between'>
				<h6 className="m-0 font-weight-bold" style={{color: 'white'}}>Your Lists</h6>
				{ insideList ? insideListButtons : createNewListButton }		
			</div>
			{ insideList ? insideListView : allListsView }
			
			{/* Modal for creating lists */}
			<div className="modal fade" id="newListModal" tabIndex="-1" role="dialog" aria-labelledby="newListModal" aria-hidden="true">
				<div className="modal-dialog modal-dialog-centered" role="document">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title">Enter List Name</h5>
							<button type="button" className="close" data-dismiss="modal" aria-label="Close">
								<span aria-hidden="true">&times;</span>
							</button>
						</div>
						<form onSubmit={handleListTitleSubmit}>
							<div className="modal-body">
								<div className="form-group">
									<label htmlFor="list-title" className="col-form-label" aria-label="List Name" style={{display: 'hidden'}}></label>
									<input type="text" className="form-control" id="list-title" placeholder="Movies to Watch" value={listTitleInput} onChange={({ target }) => setListTitleInput(target.value)}/>
								</div>
							</div>
							<div className="modal-footer">
								<button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
								<button type="submit" className="btn btn-primary">Save changes</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
});

ListApp.displayName = 'ListApp';

ListApp.propTypes = {
	ws: PropTypes.object,
	userInfo: PropTypes.object
};

export default ListApp;