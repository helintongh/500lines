(function(global){
	'use strict';

    // When we're dragging, we'll need to reference these from different stages
    // of the dragging callback dance
    //
	var dragTarget = null; // Block we're dragging
	var dragType = null; // Are we dragging from the menu or from the script?
	var scriptBlocks = []; // Blocks in the script, sorted by position
	var nextBlock = null; // Block we'll be inserting before

	function dragStart(evt){
		if (!matches(evt.target, '.block')) return;
		if (matches(evt.target, '.menu .block')){
			dragType = 'menu';
		}else{
			dragType = 'script';
		}
		evt.target.classList.add('dragging');
		dragTarget = evt.target;
		scriptBlocks = [].slice.call(document.querySelectorAll('.script .block:not(.dragging)'));
		// For dragging to take place in Firefox, we have to set this, even if we don't use it
		evt.dataTransfer.setData('text/html', evt.target.outerHTML);
		if (matches(evt.target, '.menu .block')){
			evt.dataTransfer.effectAllowed = 'copy';
		}else{
			evt.dataTransfer.effectAllowed = 'move';
		}
	}

	function findPosition(evt){
		// Find which block we should insert the dragged block before
		var prevBlock = nextBlock;
		nextBlock = null;
		// x, pageX, clientX, layerX, screenX 
		var x = evt.clientX;
		var y = evt.clientY;
		var offset = 15; // pixels cursor can overlap a block by
		for (var i = 0; i < scriptBlocks.length; i++){
			var block = scriptBlocks[i];
			var rect = block.getBoundingClientRect();
			if (y < (rect.top + offset)){
				nextBlock = block;
				break;
			}
		}
		if (prevBlock !== nextBlock){
			if (prevBlock){
				prevBlock.classList.remove('next');
			}
			if (nextBlock){
				nextBlock.classList.add('next');
			}
		}
	}

	function dragEnter(evt){
		// evlog(evt);
		if (matches(evt.target, '.menu, .script, .content')){
			evt.target.classList.add('over');
			if (evt.preventDefault) {
				evt.preventDefault(); // Necessary. Allows us to drop.
			}
		}else{
			if (!matches(evt.target, '.menu *, .script *')){
				var over = document.querySelector('.over');
				if (over){
					over.classList.remove('over');
				}
				evt.target.classList.remove('over');
			}
		}
		return false;
	}

	function dragOver(evt){
		// evlog(evt);
		if (!matches(evt.target, '.menu, .menu *, .script, .script *, .content')) return;
		if (evt.preventDefault) {
			evt.preventDefault(); // Necessary. Allows us to drop.
			}
			if (dragType === 'menu'){
			evt.dataTransfer.dropEffect = 'copy';  // See the section on the DataTransfer object.
		}else{
			evt.dataTransfer.dropEffect = 'move';
		}
		return false;
	}

	function drop(evt){
		if (!matches(evt.target, '.menu, .menu *, .script, .script *')) return;
		var dropTarget = closest(evt.target, '.script .container, .menu, .script');
		// find position on drop vs. drag because of bug in Firefox drag event (no clientX, etc)
		// should also improve drag performance, but doesn't give opportunity to provide user
		// feedback during drag
		findPosition(evt);
		var dropType = 'script';
		if (matches(dropTarget, '.menu')){
			dropType = 'menu';
		}
		if (evt.stopPropagation) {
		    evt.stopPropagation(); // stops the browser from redirecting.
		}
		if (dragType === 'script' && dropType === 'menu'){
			// If dragging from script to menu, delete dragTarget
			dragTarget.parentElement.removeChild(dragTarget);
		}else if (dragType ==='script' && dropType === 'script'){
  			// If dragging from script to script, move dragTarget
  			if (nextBlock){
	  			nextBlock.parentElement.insertBefore(dragTarget, nextBlock);
	  		}else{
	  			dropTarget.appendChild(dragTarget);
	  		}
		}else if (dragType === 'menu' && dropType === 'script'){
			// If dragging from menu to script, copy dragTarget
			var newNode = dragTarget.cloneNode(true);
			newNode.classList.remove('dragging');
			if (nextBlock){
				nextBlock.parentElement.insertBefore(newNode, nextBlock);
			}else{
				dropTarget.appendChild(newNode);
			}
		}else{
  			// If dragging from menu to menu, do nothing
		}
	};

	function dragEnd(evt){
		// this looks like a good place for a helper class
		var dragging = document.querySelector('.dragging');
		if (dragging){
			dragging.classList.remove('dragging');
		}
		var over = document.querySelector('.over');
		if (over){
			over.classList.remove('over');
		}
		var next = document.querySelector('.next');
		if (next){
			next.classList.remove('next');
		}
	}

	document.addEventListener('dragstart', dragStart, false);
	document.addEventListener('dragenter', dragEnter, false);
	document.addEventListener('dragover', dragOver, false);
	document.addEventListener('drag', function(){}, false);
	document.addEventListener('drop', drop, false);	
	document.addEventListener('dragend', dragEnd, false);
})(window);