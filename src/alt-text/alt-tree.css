/* https://iamkate.com/code/tree-views/ */

.alt-tree {
    --spacing : 1.5rem;
    --radius  : 10px;
}

.alt-tree li{
    display      : block;
    position     : relative;
    padding-left : calc(2 * var(--spacing) - var(--radius) - 2px);
}

.alt-tree ul{
    margin-left  : calc(var(--radius) - var(--spacing));
    padding-left : 0;
}

.alt-tree ul li{
    border-left : 2px solid #ddd;
}
  
.alt-tree ul li:last-child{
    border-color : transparent;
}
  
.alt-tree ul li::before{
    content      : '';
    display      : block;
    position     : absolute;
    top          : calc(var(--spacing) / -2);
    left         : -2px;
    width        : calc(var(--spacing) + 2px);
    height       : calc(var(--spacing) + 1px);
    border       : solid #ddd;
    border-width : 0 0 2px 2px;
}

.tree .alt-single{
    display : block;
    cursor  : pointer;
}

.tree li::before{
    z-index    : 1;
    background : #696 url('expand-collapse.svg') 0 0;
}