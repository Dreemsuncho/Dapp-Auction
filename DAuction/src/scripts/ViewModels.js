
let vmInit = function (FactoryAuction) {

    component = Vue.component('list-auction', {
        props: ["item"],
        template: `
            <li>Name: {{ item }}</li>
        `,
    })

    component = Vue.component('create-auction', {
        template: `
            <section>
                Duration: <input type="number" name="duration" id="duration">
                Start Amount: <input type="number" name="start-auction-amount" id="start-auction-amount">
                <button @click="$emit('create-auction')">Create Auction</button>
            </section>
            `,
    })

    const app = new Vue({
        el: "#app",
        data: {
            title: "Welcome to Auction",
            auctions: []
        },
        methods: {
            createAuction: function () {
                let duration = document.getElementById("duration").value;
                let startAmount = document.getElementById("start-auction-amount").value;

                let auctionOwner = web3.eth.accounts[0];
                FactoryAuction.createAuction(duration, startAmount, { from: auctionOwner })
                    .then(async function () {
                        console.log(await FactoryAuction.getAuctions()); 
                        // TODO
                    });
            }
        },

        beforeCreate: function () {
        },

        created: async function () {
            this.auctions = await FactoryAuction.getAuctions();
            this.auctions.map(mapAuctions);
        }
    });
}

module.exports = { vmInit }


function mapAuctions(addr, ind) {
    return { id: ind, address: addr }
}


function initComponents() {
    
}

